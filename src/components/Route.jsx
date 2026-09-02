import { useEffect, useRef } from 'react';

const clamp01 = (value) => Math.min(Math.max(value, 0), 1);

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
      const vh = window.innerHeight;
      const rect = node.getBoundingClientRect();
      const scrolled = window.scrollY;
      const maxScroll = document.documentElement.scrollHeight - vh;
      const railBottom = rect.top + scrolled + rect.height;

      // Линия закрашена до середины экрана. Рельс кончается вместе со
      // страницей, поэтому на последнем экране середине уже некуда ехать —
      // ей не хватает ровно того, что осталось ниже. На этом отрезке плавно
      // опускаем метку к низу окна, иначе линия не доходит до последней
      // остановки.
      const shortfall = Math.max(railBottom - (maxScroll + vh * 0.5), 0);
      const ramp = Math.min(vh, maxScroll);
      const tail = ramp > 0 ? clamp01((scrolled - maxScroll + ramp) / ramp) : 1;
      const marker = vh * 0.5 + shortfall * tail;

      const ratio = clamp01((marker - rect.top) / rect.height);
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
