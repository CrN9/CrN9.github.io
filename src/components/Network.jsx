import { useEffect, useRef, useState } from 'react';

/**
 * Схема того, что делает дипломная система: сеть города и найденный по ней
 * маршрут. У проекта нет скриншотов, а объяснить его словами дольше,
 * чем показать.
 */
const NODES = {
  a: [60, 252],
  b: [150, 84],
  c: [252, 262],
  d: [342, 92],
  e: [392, 208],
  f: [478, 300],
  g: [520, 122],
  h: [612, 232],
  i: [662, 82],
  j: [300, 170],
  k: [140, 322],
};

const EDGES = [
  ['a', 'b'],
  ['a', 'k'],
  ['a', 'c'],
  ['b', 'j'],
  ['b', 'd'],
  ['j', 'c'],
  ['j', 'e'],
  ['j', 'd'],
  ['c', 'k'],
  ['c', 'e'],
  ['c', 'f'],
  ['d', 'g'],
  ['d', 'i'],
  ['e', 'g'],
  ['e', 'f'],
  ['e', 'h'],
  ['f', 'h'],
  ['g', 'i'],
  ['g', 'h'],
  ['h', 'i'],
];

const START = 'a';
const FINISH = 'i';

/**
 * Вес ребра — его длина на схеме, поэтому подсвеченный маршрут действительно
 * кратчайший из нарисованных, а не выбранный на глаз. Алгоритм Дейкстры —
 * тот же, что считает маршруты в дипломной системе.
 */
function shortestPath(start, finish) {
  const neighbours = {};
  for (const [from, to] of EDGES) {
    (neighbours[from] ||= []).push(to);
    (neighbours[to] ||= []).push(from);
  }

  const span = (from, to) =>
    Math.hypot(NODES[from][0] - NODES[to][0], NODES[from][1] - NODES[to][1]);

  const dist = {};
  const came = {};
  const unvisited = new Set(Object.keys(NODES));
  for (const id of unvisited) dist[id] = Infinity;
  dist[start] = 0;

  while (unvisited.size) {
    let nearest = null;
    for (const id of unvisited) {
      if (nearest === null || dist[id] < dist[nearest]) nearest = id;
    }
    unvisited.delete(nearest);
    if (nearest === finish) break;

    for (const next of neighbours[nearest]) {
      const through = dist[nearest] + span(nearest, next);
      if (through < dist[next]) {
        dist[next] = through;
        came[next] = nearest;
      }
    }
  }

  const route = [finish];
  while (route[0] !== start) route.unshift(came[route[0]]);
  return route;
}

const ROUTE = shortestPath(START, FINISH);

export default function Network({ caption }) {
  const path = useRef(null);
  const [length, setLength] = useState(1200);

  useEffect(() => {
    if (path.current) setLength(Math.ceil(path.current.getTotalLength()));
  }, []);

  const points = ROUTE.map((id) => NODES[id].join(',')).join(' ');
  const onRoute = new Set(ROUTE);

  return (
    <figure className="network">
      <svg
        viewBox="0 0 720 340"
        role="img"
        aria-label="Схема городской сети с найденным маршрутом"
      >
        {EDGES.map(([from, to]) => (
          <line
            key={`${from}${to}`}
            className="network__edge"
            x1={NODES[from][0]}
            y1={NODES[from][1]}
            x2={NODES[to][0]}
            y2={NODES[to][1]}
          />
        ))}

        <polyline
          ref={path}
          className="network__route"
          points={points}
          style={{ '--len': length }}
        />

        {Object.entries(NODES).map(([id, [x, y]]) => (
          <circle
            key={id}
            className={`network__node${onRoute.has(id) ? ' network__node--on' : ''}`}
            cx={x}
            cy={y}
            r={onRoute.has(id) ? 6 : 4.5}
          />
        ))}

        <text className="network__label" x={NODES[START][0] - 4} y={NODES[START][1] + 26}>
          старт
        </text>
        <text
          className="network__label"
          x={NODES[FINISH][0] - 18}
          y={NODES[FINISH][1] - 16}
        >
          финиш
        </text>
      </svg>
      <figcaption className="network__caption mono">{caption}</figcaption>
    </figure>
  );
}
