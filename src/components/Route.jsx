import { useEffect, useRef } from 'react';

/**
 * Рельс маршрута: линия слева, вдоль которой идёт вся страница.
 * Закрашенная часть — то, что читатель уже проехал.
 */
export default function Route({ children }) {
  const ref = useRef(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    let frame = 0;
    const update = () => {
      frame = 0;
      const rect = node.getBoundingClientRect();
      const travelled = window.innerHeight * 0.5 - rect.top;
      const ratio = Math.min(Math.max(travelled / rect.height, 0), 1);
      node.style.setProperty('--progress', `${ratio * 100}%`);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);

  return (
    <div className="route" ref={ref}>
      <span className="route__fill" aria-hidden="true" />
      {children}
    </div>
  );
}
