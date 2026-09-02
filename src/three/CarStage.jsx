import { Suspense, useEffect, useMemo, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Environment, Lightformer, useGLTF } from '@react-three/drei';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import * as THREE from 'three';

gsap.registerPlugin(ScrollTrigger);

const MODEL = `${import.meta.env.BASE_URL}models/car.glb`;

const lerp = (a, b, t) => a + (b - a) * t;

const anchorOf = (name) =>
  document.querySelector(`[data-car-anchor="${name}"]`);

/** Помечает бокс, в котором машина сейчас стоит: только его и можно крутить. */
function markGrabbable(name) {
  document
    .querySelectorAll('[data-car-grab]')
    .forEach((node) => delete node.dataset.carGrab);
  const node = name && anchorOf(name);
  if (node) node.dataset.carGrab = 'on';
}

/**
 * Машина едет по странице. Один canvas на весь экран; где она находится,
 * задают два якоря в разметке — блок в шапке и блок внутри «Пассажирского
 * маршрута».
 *
 * Ведёт всё GSAP:
 *   u    — путь между якорями, scrub-триггер. Скраб даёт инерцию:
 *          машина догоняет скролл, а не приклеена к нему намертво.
 *   lane — съезд в левую полосу. Это обычный твин по времени, он не
 *          зависит от того, как быстро и куда крутят страницу.
 */
function Car({ still }) {
  const group = useRef();
  const { scene } = useGLTF(MODEL);
  const { size, viewport } = useThree();
  const journey = useRef({ u: 0, lane: 0 });
  // Поворот модели: копится сам, а пока машину тянут — задаётся рукой.
  const spin = useRef({ angle: still ? 0.6 : 0, grabbed: false });
  // Бокс, в котором машина сейчас стоит: только его и можно крутить.
  const holder = useRef(null);

  // Нормализуем модель: центр в нуле, наибольший габарит — одна единица.
  const { object, unit } = useMemo(() => {
    const root = scene.clone(true);
    const box = new THREE.Box3().setFromObject(root);
    const center = box.getCenter(new THREE.Vector3());
    const span = box.getSize(new THREE.Vector3());
    root.position.sub(center);
    const wrap = new THREE.Group();
    wrap.add(root);
    // Машина вытянута по Z, а при вращении к нам поворачивается то бок,
    // то длина — нормируем по наибольшему горизонтальному габариту.
    return { object: wrap, unit: Math.max(span.x, span.z) || 1 };
  }, [scene]);

  const anchors = useRef({ hero: null, project: null, head: null });

  useEffect(() => {
    const hero = anchorOf('hero');
    const project = anchorOf('project');
    anchors.current = {
      hero,
      project,
      // Левая граница текста: за неё машина на перегоне не заезжает.
      head: document.querySelector('.station__head'),
    };
    if (!hero || !project) return undefined;

    const state = journey.current;

    // Без анимаций просто перекидываем машину между стоянками.
    if (still) {
      const plain = ScrollTrigger.create({
        trigger: hero,
        start: 'center center',
        endTrigger: project,
        end: 'center center',
        onUpdate: (self) => {
          state.u = self.progress < 0.5 ? 0 : 1;
        },
      });
      return () => plain.kill();
    }

    let docked = true;
    const setLane = (value) =>
      gsap.to(state, {
        lane: value,
        duration: value ? 0.55 : 0.75,
        ease: value ? 'power3.out' : 'power2.inOut',
        overwrite: 'auto',
      });

    const drive = gsap.to(state, {
      u: 1,
      ease: 'none',
      scrollTrigger: {
        trigger: hero,
        start: 'center center',
        endTrigger: project,
        end: 'center center',
        scrub: 0.8,
        invalidateOnRefresh: true,
      },
      onUpdate: () => {
        const travelling = state.u > 0.02 && state.u < 0.98;
        if (travelling !== docked) return;
        docked = !travelling;
        setLane(travelling ? 1 : 0);
      },
    });

    const refresh = requestAnimationFrame(() => ScrollTrigger.refresh());

    return () => {
      cancelAnimationFrame(refresh);
      drive.scrollTrigger?.kill();
      drive.kill();
      gsap.killTweensOf(state);
    };
  }, [still]);

  // Пока машина стоит в боксе, её можно повернуть мышью или пальцем.
  useEffect(() => {
    const nodes = ['hero', 'project'].map(anchorOf).filter(Boolean);
    if (!nodes.length) return undefined;

    const view = spin.current;
    let active = null;
    let lastX = 0;

    const onDown = (event) => {
      const node = event.currentTarget;
      if (node.dataset.carGrab !== 'on') return;
      // Иначе мышь потащит за собой выделение подписи в боксе.
      event.preventDefault();
      active = node;
      lastX = event.clientX;
      view.grabbed = true;
      node.dataset.carGrab = 'drag';
      node.setPointerCapture(event.pointerId);
    };

    const onMove = (event) => {
      if (active !== event.currentTarget) return;
      // Полный оборот — примерно за 600 px хода.
      view.angle += (event.clientX - lastX) * 0.01;
      lastX = event.clientX;
    };

    // Захват браузер снимает сам; нам остаётся вернуть курсор и вращение.
    const onUp = () => {
      if (!active) return;
      if (active.dataset.carGrab === 'drag') active.dataset.carGrab = 'on';
      active = null;
      view.grabbed = false;
    };

    nodes.forEach((node) => {
      node.addEventListener('pointerdown', onDown);
      node.addEventListener('pointermove', onMove);
      node.addEventListener('pointerup', onUp);
      node.addEventListener('pointercancel', onUp);
    });

    return () => {
      nodes.forEach((node) => {
        node.removeEventListener('pointerdown', onDown);
        node.removeEventListener('pointermove', onMove);
        node.removeEventListener('pointerup', onUp);
        node.removeEventListener('pointercancel', onUp);
        delete node.dataset.carGrab;
      });
    };
  }, []);

  useFrame((_, delta) => {
    const node = group.current;
    const { hero, project, head } = anchors.current;
    if (!node || !hero || !project) return;

    const { u, lane } = journey.current;
    const vh = size.height;
    const perPx = viewport.height / vh;

    const hr = hero.getBoundingClientRect();
    const pr = project.getBoundingClientRect();

    // Обе стоянки берём в координатах экрана — они и так едут вместе
    // со страницей, отдельная арифметика скролла не нужна.
    const boxY = lerp(hr.top + hr.height / 2, pr.top + pr.height / 2, u);
    const boxX = lerp(hr.left + hr.width / 2, pr.left + pr.width / 2, u);
    const boxW = lerp(hr.width * 0.62, pr.width * 0.8, u);

    // Полоса для перегона — слева от всего текста.
    const textLeft = head ? head.getBoundingClientRect().left : pr.left;
    const laneRight = textLeft - 18;
    const laneWidth = Math.min(190, laneRight - 26);
    const laneX = laneRight - laneWidth / 2;

    const screenX = lerp(boxX, laneX, lane);
    const width = lerp(boxW, laneWidth, lane);

    node.position.x = (screenX - size.width / 2) * perPx;
    node.position.y = -(boxY - vh / 2) * perPx;
    node.scale.setScalar((width * perPx) / unit);

    // Стоит и никто не держит — поворачивается сама. Угол копим, чтобы
    // после перетаскивания она продолжила с того места, где её оставили.
    const view = spin.current;
    if (!still && !view.grabbed) view.angle += Math.min(delta, 0.1) * 0.22;

    // На перегоне разворачиваем в профиль — машина «едет», а не позирует.
    node.rotation.y = view.angle * (1 - lane) + (-Math.PI / 2) * lane;
    node.rotation.z = -lane * 0.05;

    const onScreen = boxY > -vh * 0.6 && boxY < vh * 1.6;
    // Если полосы слева не хватает (узкий экран, одноколоночная вёрстка),
    // на перегоне машину не показываем совсем.
    node.visible = onScreen && (lane < 0.5 || laneWidth >= 110);

    // Крутить можно только там, где машина действительно стоит: на перегоне
    // ею распоряжается скролл.
    const standing = lane < 0.05 && (u < 0.02 || u > 0.98);
    const parked =
      node.visible && standing ? (u < 0.5 ? 'hero' : 'project') : null;
    if (parked !== holder.current) {
      holder.current = parked;
      if (!parked) view.grabbed = false;
      markGrabbable(parked);
    }
  });

  return <primitive ref={group} object={object} />;
}

useGLTF.preload(MODEL);

export default function CarStage() {
  const still = useMemo(
    () => window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    [],
  );

  return (
    <div className="car-stage" aria-hidden="true">
      <Canvas
        dpr={[1, 1.75]}
        camera={{ position: [0, 0, 6], fov: 35 }}
        gl={{ antialias: true, alpha: true }}
        /* R3F ставит своей обёртке pointer-events: auto инлайном, и она,
           растянутая на весь экран, перехватывает клики по ссылкам. */
        style={{ pointerEvents: 'none' }}
      >
        <ambientLight intensity={0.75} />
        <directionalLight position={[5, 8, 4]} intensity={2.2} />
        <directionalLight position={[-6, 3, -4]} intensity={0.7} />
        <Suspense fallback={null}>
          <Car still={still} />
          <Environment resolution={128}>
            <Lightformer
              intensity={2.4}
              position={[0, 5, 2]}
              scale={[10, 4, 1]}
            />
            <Lightformer
              intensity={1.3}
              position={[-5, 1, 2]}
              scale={[4, 5, 1]}
            />
            <Lightformer
              intensity={1.5}
              position={[5, 0, 1]}
              scale={[4, 5, 1]}
            />
          </Environment>
        </Suspense>
      </Canvas>
    </div>
  );
}
