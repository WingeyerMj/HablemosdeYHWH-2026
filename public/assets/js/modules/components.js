export const initAOS = () => {
    if (typeof AOS !== 'undefined') {
        AOS.init({
            duration: 600,
            easing: 'ease-in-out',
            once: true,
            mirror: false
        });
    }
};

export const initSwiper = () => {
    document.querySelectorAll(".init-swiper").forEach(function (swiperElement) {
        let config = JSON.parse(
            swiperElement.querySelector(".swiper-config").innerHTML.trim()
        );
        if (swiperElement.swiper) return;
        const count = swiperElement.querySelectorAll('.swiper-wrapper > .swiper-slide').length;
        if (!count) return;
        // Rewind cycles through the real slides at every responsive width.
        // Unlike loop, it needs no duplicated slides or minimum visible count.
        if (config.loop) {
            config.loop = false;
            config.rewind = count > 1;
        }
        config.watchOverflow = true;
        if (count === 1) config.autoplay = false;
        new Swiper(swiperElement, config);
    });
};

export const initGLightbox = () => {
    if (typeof GLightbox !== 'undefined') {
        GLightbox({ selector: '.glightbox' });
    }
};

export const initIsotope = () => {
    document.querySelectorAll('.isotope-layout').forEach(function (isotopeItem) {
        let layout = isotopeItem.getAttribute('data-layout') ?? 'masonry';
        let filter = isotopeItem.getAttribute('data-default-filter') ?? '*';
        let sort = isotopeItem.getAttribute('data-sort') ?? 'original-order';

        let initIsotope;
        imagesLoaded(isotopeItem.querySelector('.isotope-container'), function () {
            initIsotope = new Isotope(isotopeItem.querySelector('.isotope-container'), {
                itemSelector: '.isotope-item',
                layoutMode: layout,
                filter: filter,
                sortBy: sort
            });
        });

        isotopeItem.querySelectorAll('.isotope-filters li').forEach(function (filters) {
            filters.addEventListener('click', function () {
                isotopeItem.querySelector('.isotope-filters .filter-active').classList.remove('filter-active');
                this.classList.add('filter-active');
                initIsotope.arrange({ filter: this.getAttribute('data-filter') });
            }, false);
        });
    });
};
