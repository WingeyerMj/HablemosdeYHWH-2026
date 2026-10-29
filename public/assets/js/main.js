import { initNav } from './modules/nav.js';
import { initAOS, initSwiper, initGLightbox, initIsotope } from './modules/components.js';

(function () {
  "use strict";

  initNav();

  window.addEventListener('load', () => {
    // Quitar el preloader primero, para que nunca quede "pensando" (ej. sin internet)
    const preloader = document.querySelector('#preloader');
    if (preloader) {
      preloader.remove();
    }

    [initAOS, initSwiper, initGLightbox, initIsotope].forEach((init) => {
      try { init(); } catch (e) { console.warn('Aviso al iniciar componente:', e); }
    });
  });

  // Scroll top
  const scrollTop = document.querySelector('.scroll-top');
  if (scrollTop) {
    const toggleScrollTop = () => {
      if (window.scrollY > 150) {
        scrollTop.classList.add('active');
      } else {
        scrollTop.classList.remove('active');
      }
    };
    window.addEventListener('load', toggleScrollTop);
    document.addEventListener('scroll', toggleScrollTop);
    scrollTop.addEventListener('click', (e) => {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

})();