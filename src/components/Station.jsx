import { useInView } from '../hooks/useInView.js';

/** Секция-остановка: номер, заголовок и содержимое. tone — цвет ветки. */
export default function Station({ id, num, title, tone = 1, children }) {
  const [ref, live] = useInView();

  return (
    <section
      id={id}
      ref={ref}
      className={`station${live ? ' is-live' : ''}`}
      style={{ '--stop': `var(--c${tone})` }}
    >
      <div className="station__grid">
        <header className="station__head">
          <span className="station__num">{num}</span>
          <h2 className="station__title">{title}</h2>
        </header>
        <div className="station__body reveal">{children}</div>
      </div>
    </section>
  );
}
