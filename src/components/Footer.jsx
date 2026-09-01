import { person } from '../data/content.js';

export default function Footer() {
  return (
    <footer className="footer">
      <span className="mono">
        © {person.year} {person.fullName}
      </span>
      <span className="mono">Конечная</span>
    </footer>
  );
}
