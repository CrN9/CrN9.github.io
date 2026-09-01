import { contacts, person } from '../data/content.js';
import Station from './Station.jsx';

export default function Contact() {
  return (
    <Station id="contact" num={contacts.num} tone={5} title={contacts.title}>
      <p className="contact__lead">{contacts.lead}</p>
      <a className="contact__mail" href={`mailto:${person.email}`}>
        {person.email}
      </a>
    </Station>
  );
}
