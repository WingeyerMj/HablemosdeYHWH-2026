const test = require('node:test');
const assert = require('node:assert/strict');
const { groupFooterLinks } = require('../src/models/FooterModel');

test('footer links are deduplicated globally and unsafe URLs are neutralized', () => {
    const grouped = groupFooterLinks([
        { id: 1, category: 'Recursos', title: 'Calendario', url: '/calendar' },
        { id: 2, category: 'Recursos', title: 'Calendario', url: '/calendar' },
        { id: 3, category: 'Otra categoría', title: 'Calendario', url: '/calendar' },
        { id: 4, category: 'Recursos', title: 'Sitio', url: 'javascript:alert(1)' },
        { id: 5, category: 'Recursos', title: 'Oculto', url: '/oculto', is_active: 0 }
    ]);
    assert.deepEqual(Object.keys(grouped), ['Recursos']);
    assert.equal(grouped.Recursos.length, 2);
    assert.equal(grouped.Recursos[0].url, '/calendar');
    assert.equal(grouped.Recursos[1].url, '#');
});