import { lazy, Suspense } from 'react';
import About from './components/About.jsx';
import Contact from './components/Contact.jsx';
import Education from './components/Education.jsx';
import Footer from './components/Footer.jsx';
import Hero from './components/Hero.jsx';
import Route from './components/Route.jsx';

import Skills from './components/Skills.jsx';
import Works from './components/Works.jsx';

// Three.js тяжелее всей остальной страницы — грузим отдельным чанком.
const CarStage = lazy(() => import('./three/CarStage.jsx'));

export default function App() {
  return (
    <>
      <div className="grid-bg" aria-hidden="true" />
      <Suspense fallback={null}>
        <CarStage />
      </Suspense>
      <div className="shell">
        <Hero />
        <Route>
          <main>
            <About />
            <Works />
            <Skills />
            <Education />
            <Contact />
          </main>
          <Footer />
        </Route>
      </div>
    </>
  );
}
