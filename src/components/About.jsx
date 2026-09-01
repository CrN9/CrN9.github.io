import { about, intro } from '../data/content.js';
import Station from './Station.jsx';

export default function About() {
  return (
    <Station id="about" num={about.num} tone={1} title={about.title}>
      <div className="prose">
        {intro.map((text) => (
          <p key={text.slice(0, 24)}>{text}</p>
        ))}
      </div>
    </Station>
  );
}
