const dataModel = {
    getHomeData: () => {
        return {
            services: [
                { title: 'Lorem Ipsum', desc: 'Voluptatum deleniti atque corrupti quos dolores et quas molestias excepturi sint occaecati cupiditate non provident', icon: 'bi-briefcase' },
                { title: 'Dolor Sitema', desc: 'Minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat tarad limino ata', icon: 'bi-card-checklist' },
                { title: 'Sed ut perspiciatis', desc: 'Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur', icon: 'bi-bar-chart' },
                { title: 'Magni Dolores', desc: 'Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum', icon: 'bi-binoculars' },
                { title: 'Nemo Enim', desc: 'At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum deleniti atque', icon: 'bi-brightness-high' },
                { title: 'Eiusmod Tempor', desc: 'Et harum quidem rerum facilis est et expedita distinctio. Nam libero tempore, cum soluta nobis est eligendi', icon: 'bi-calendar4-week' }
            ],
            portfolio: [
                { id: 1, title: 'App 1', category: 'filter-app', img: '/assets/img/masonry-portfolio/masonry-portfolio-1.jpg', desc: 'Lorem ipsum, dolor sit' },
                { id: 2, title: 'Product 1', category: 'filter-product', img: '/assets/img/masonry-portfolio/masonry-portfolio-2.jpg', desc: 'Lorem ipsum, dolor sit' },
                { id: 3, title: 'Branding 1', category: 'filter-branding', img: '/assets/img/masonry-portfolio/masonry-portfolio-3.jpg', desc: 'Lorem ipsum, dolor sit' }
            ],
            team: [
                { name: 'Jeremy Walker', role: 'CEO, Founder, Atty.', desc: 'Separated they live in. Separated they live in Bookmarksgrove.', img: '/assets/img/team/team-1.jpg' },
                { name: 'Lawson Arnold', role: 'CEO, Founder, Atty.', desc: 'Separated they live in. Separated they live in Bookmarksgrove.', img: '/assets/img/team/team-2.jpg' }
            ],
            pricing: [
                { name: 'Free Plan', price: '0', features: ['Feature 1', 'Feature 2'], na_features: ['Feature 3'], featured: false },
                { name: 'Business Plan', price: '29', features: ['Feature 1', 'Feature 2', 'Feature 3'], na_features: [], featured: true }
            ],
            testimonials: [
                { name: 'Saul Goodman', role: 'Ceo & Founder', text: 'Proin iaculis purus consequat sem cure digni ssim.', img: '/assets/img/testimonials/testimonials-1.jpg' }
            ]
        };
    }
};

module.exports = dataModel;
