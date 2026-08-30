export const initNav = () => {
    "use strict";

    const toggleScrolled = () => {
        const selectBody = document.querySelector('body');
        const selectHeader = document.querySelector('#header');
        if (!selectHeader) return;
        if (!selectHeader.classList.contains('scroll-up-sticky') && !selectHeader.classList.contains('sticky-top') && !selectHeader.classList.contains('fixed-top')) return;
        window.scrollY > 100 ? selectBody.classList.add('scrolled') : selectBody.classList.remove('scrolled');
    };

    document.addEventListener('scroll', toggleScrolled);
    window.addEventListener('load', toggleScrolled);

    const mobileNavToggleBtn = document.querySelector('.mobile-nav-toggle');
    const mobileNavToogle = () => {
        document.querySelector('body').classList.toggle('mobile-nav-active');
        mobileNavToggleBtn.classList.toggle('bi-list');
        mobileNavToggleBtn.classList.toggle('bi-x');
    };

    if (mobileNavToggleBtn) {
        mobileNavToggleBtn.addEventListener('click', mobileNavToogle);
    }

    document.querySelectorAll('#navmenu a').forEach(navmenu => {
        navmenu.addEventListener('click', () => {
            // Do not close mobile nav if clicking on a dropdown parent
            if (navmenu.closest('.dropdown') && navmenu.nextElementSibling && navmenu.nextElementSibling.tagName === 'UL') {
                return;
            }
            if (document.querySelector('.mobile-nav-active')) {
                mobileNavToogle();
            }
        });
    });

    // Mobile dropdown toggle by clicking parent item
    document.querySelectorAll('.navmenu .dropdown > a').forEach(dropdownToggle => {
        dropdownToggle.addEventListener('click', function (e) {
            if (window.innerWidth < 1200 || document.querySelector('.mobile-nav-active')) {
                e.preventDefault();
                this.classList.toggle('active');
                const subMenu = this.nextElementSibling;
                if (subMenu) {
                    subMenu.classList.toggle('dropdown-active');
                }
                e.stopImmediatePropagation();
            }
        });
    });

    document.querySelectorAll('.navmenu .toggle-dropdown').forEach(navmenu => {
        navmenu.addEventListener('click', function (e) {
            if (window.innerWidth < 1200 || document.querySelector('.mobile-nav-active')) {
                e.preventDefault();
                const parentLink = this.closest('a');
                if (parentLink) {
                    parentLink.classList.toggle('active');
                    const subMenu = parentLink.nextElementSibling;
                    if (subMenu) {
                        subMenu.classList.toggle('dropdown-active');
                    }
                }
                e.stopImmediatePropagation();
            }
        });
    });
};
