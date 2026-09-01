import { education } from '../data/content.js';
import Station from './Station.jsx';

export default function Education() {
  return (
    <Station
      id="education"
      num={education.num}
      tone={4}
      title={education.title}
    >
      <dl className="facts">
        {education.items.map((item) => (
          <div className="facts__row" key={item.degree}>
            <dt>{item.period}</dt>
            <dd>
              {item.degree}
              <span className="facts__sub">{item.place}</span>
            </dd>
          </div>
        ))}
        <div className="facts__row">
          <dt>Языки</dt>
          <dd>{education.languages}</dd>
        </div>
      </dl>
    </Station>
  );
}
