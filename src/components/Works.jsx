import { projects } from '../data/content.js';
import Chart from './Chart.jsx';
import Network from './Network.jsx';
import Results from './Results.jsx';
import Station from './Station.jsx';

export default function Works() {
  return (
    <Station id="works" num={projects.num} tone={2} title={projects.title}>
      {projects.items.map((project) => (
        <article className="work" key={project.id}>
          <h3 className="work__title">{project.title}</h3>
          <p className="work__meta mono">{project.meta}</p>
          {project.summary && (
            <p className="work__summary">{project.summary}</p>
          )}
          {project.pending && (
            <p className="work__pending mono">{project.pending}</p>
          )}

          {project.id === 'route' && (
            <figure className="car-slot">
              <div className="car-slot__box" data-car-anchor="project" />
              <figcaption className="mono">{project.carCaption}</figcaption>
            </figure>
          )}

          {project.chart && (
            <Chart steps={project.chart} caption={project.chartCaption} />
          )}

          {project.images && (
            <figure
              className={`gallery${project.images[0].wide ? ' gallery--wide' : ''}`}
            >
              {project.images.map((image) => (
                <img
                  key={image.src}
                  src={`${import.meta.env.BASE_URL}${image.src}`}
                  width={image.width}
                  height={image.height}
                  alt={image.alt}
                  loading="lazy"
                  decoding="async"
                />
              ))}
              <figcaption className="mono">{project.imagesCaption}</figcaption>
            </figure>
          )}

          {project.network && <Network caption={project.networkCaption} />}

          {project.results && <Results data={project.results} />}

          <div className="work__foot">
            {project.stack && <span>{project.stack}</span>}
            {project.role && <span>Роль: {project.role}</span>}
          </div>
        </article>
      ))}
    </Station>
  );
}
