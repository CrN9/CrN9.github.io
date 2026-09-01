import { useEffect, useRef, useState } from 'react';

/** Добавляет класс, когда блок доезжает до экрана. Срабатывает один раз. */
export function useInView({ threshold = 0, once = true } = {}) {
  const ref = useRef(null);
  const [live, setLive] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setLive(true);
          if (once) observer.disconnect();
        } else if (!once) {
          setLive(false);
        }
      },
      // threshold 0: высокая секция может никогда не занять долю экрана
      // на низком вьюпорте — тогда блок остался бы невидимым навсегда.
      { threshold, rootMargin: '0px 0px -10% 0px' },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [threshold, once]);

  return [ref, live];
}
