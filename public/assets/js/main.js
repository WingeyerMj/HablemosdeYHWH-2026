import { initNav } from './modules/nav.js';
import { initAOS, initSwiper, initGLightbox, initIsotope } from './modules/components.js';

(function () {
  "use strict";

  initNav();

  window.addEventListener('load', () => {
    initAOS();
    initSwiper();
    initGLightbox();
    initIsotope();

    const preloader = document.querySelector('#preloader');
    if (preloader) {
      preloader.remove();
    }
  });

  // Scroll top
  let scrollTop = document.querySelector('.scroll-top');
  if (scrollTop) {
    scrollTop.addEventListener('click', (e) => {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

})();