import { hero, person, stops } from '../data/content.js';

export default function Hero() {
  return (
    <header className="hero">
      <p className="hero__kicker mono">
        {person.role} · {person.city}
      </p>

      <div className="hero__grid">
        <div>
          <h1 className="hero__title">
            {hero.title.map((line) => (
              <span key={line}>{line}</span>
            ))}
          </h1>
          <p className="hero__lede">{hero.lede}</p>
        </div>

        {/* Оглавление как маршрутный лист: те же остановки, что и на рельсе. */}
        <nav className="index" aria-label="Разделы">
          {stops.map((stop) => (
            <a className="index__row" href={stop.href} key={stop.num}>
              <span className="index__num mono">{stop.num}</span>
              <span className="index__label">{stop.label}</span>
            </a>
          ))}
        </nav>
      </div>

      {/* Машину рисует общий canvas — здесь только место под неё. */}
      <div className="stage" data-car-anchor="hero">
        <span className="stage__tag mono">{hero.stageTag}</span>
      </div>
    </header>
  );
}
