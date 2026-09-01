/**
 * Ступени прогрессии: семь порогов из «Пассажирского маршрута».
 * Полосы растут по порядку — семь чисел читаются как одна кривая.
 */
export default function Chart({ steps, caption }) {
  const max = Math.max(...steps.map((step) => step.at));

  return (
    <figure className="chart">
      {steps.map((step, i) => (
        <div
          className="chart__row"
          key={step.at}
          style={{ '--bar': `var(--r${Math.min(i + 1, 7)})` }}
        >
          <span className="chart__num">{step.at}</span>
          <span className="chart__name">{step.name}</span>
          <span className="chart__track">
            <span
              className="chart__bar"
              style={{
                '--w': `${(step.at / max) * 100}%`,
                '--delay': `${i * 90}ms`,
              }}
            />
          </span>
        </div>
      ))}
      <figcaption className="chart__caption mono">{caption}</figcaption>
    </figure>
  );
}
