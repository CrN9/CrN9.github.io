import { skills } from '../data/content.js';
import Station from './Station.jsx';

export default function Skills() {
  return (
    <Station id="skills" num={skills.num} tone={3} title={skills.title}>
      <dl className="facts">
        {skills.groups.map((group) => (
          <div className="facts__row" key={group.title}>
            <dt>{group.title}</dt>
            <dd>{group.items}</dd>
          </div>
        ))}
      </dl>
    </Station>
  );
}
