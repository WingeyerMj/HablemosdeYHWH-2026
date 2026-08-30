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