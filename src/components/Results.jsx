/**
 * Результаты дипломной работы: пробег до и после внедрения системы.
 * Цифры взяты из самой работы, график перерисован в языке сайта —
 * в оригинале это диаграмма из редактора таблиц.
 */
export default function Results({ data }) {
  const max = Math.max(...data.rows.flatMap((row) => [row.manual, row.system]));

  return (
    <section className="results">
      <h4 className="results__title">{data.title}</h4>

      <ul className="legend">
        {data.legend.map((label, i) => (
          <li key={label}>
            <span
              className={
                i === 0 ? 'legend__key' : 'legend__key legend__key--on'
              }
            />
            {label}
          </li>
        ))}
      </ul>

      <div className="bars">
        {data.rows.map((row, i) => (
          <div className="bars__group" key={i}>
            <span className="bars__label mono">{`0${i + 1}`}</span>
            <div className="bars__pair">
              <span
                className="bars__bar"
                style={{ '--w': `${(row.manual / max) * 100}%` }}
              >
                <i>{row.manual.toLocaleString('ru-RU')}</i>
              </span>
              <span
                className="bars__bar bars__bar--on"
                style={{
                  '--w': `${(row.system / max) * 100}%`,
                  '--delay': '120ms',
                }}
              >
                <i>{row.system.toLocaleString('ru-RU')}</i>
              </span>
            </div>
          </div>
        ))}
      </div>
      <p className="results__caption mono">{data.caption}</p>

      <dl className="figures">
        {data.figures.map(([term, value]) => (
          <div className="figures__row" key={term}>
            <dt>{term}</dt>
            <dd>{value}</dd>
          </div>
        ))}
      </dl>
      <p className="results__source mono">{data.source}</p>
    </section>
  );
}
