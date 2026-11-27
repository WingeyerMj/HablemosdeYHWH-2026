/**
 * Arrastrar y soltar genérico para tablas del panel de administración.
 * Uso: <tbody data-sortable-table="clave"> con filas <tr data-id="ID">.
 * Agrega una manija ⋮⋮ en la primera celda de cada fila y guarda el orden en /admin/reorder/:clave
 */
(function () {
    'use strict';

    function injectStyles() {
        if (document.getElementById('adminSortableStyles')) return;
        const st = document.createElement('style');
        st.id = 'adminSortableStyles';
        st.textContent = `
            .admin-drag-handle { cursor: grab; touch-action: none; color: #6c757d; padding: 2px 6px 2px 0; display: inline-flex; align-items: center; vertical-align: middle; user-select: none; }
            .admin-drag-handle:hover { color: #ffc107; }
            .admin-drag-ghost { opacity: 0.35; outline: 2px dashed #ffc107; background: rgba(255,193,7,0.18) !important; }
            .admin-drag-ghost td { background: transparent !important; }
            .admin-drag-active, .admin-drag-active td { background: #2b2b2b !important; box-shadow: 0 8px 24px rgba(0,0,0,0.6); cursor: grabbing !important; }
            .admin-sort-toast { position: fixed; bottom: 24px; right: 24px; z-index: 99999; padding: 10px 18px; border-radius: 10px; font-weight: 600; color: #fff; box-shadow: 0 6px 20px rgba(0,0,0,0.4); transition: opacity .3s; }
        `;
        document.head.appendChild(st);
    }

    function toast(msg, ok) {
        const el = document.createElement('div');
        el.className = 'admin-sort-toast';
        el.style.background = ok === false ? '#dc3545' : '#198754';
        el.textContent = msg;
        document.body.appendChild(el);
        setTimeout(() => { el.style.opacity = '0'; setTimeout(() => el.remove(), 400); }, 2200);
    }

    function addHandles(tbody) {
        tbody.querySelectorAll(':scope > tr[data-id]').forEach(row => {
            if (row.querySelector('.admin-drag-handle')) return;
            const cell = row.querySelector('td');
            if (!cell) return;
            const h = document.createElement('span');
            h.className = 'admin-drag-handle';
            h.title = 'Arrastrar para mover';
            h.innerHTML = '<i class="bi bi-grip-vertical fs-5"></i>';
            cell.insertBefore(h, cell.firstChild);
        });
    }

    async function persist(tbody) {
        const key = tbody.getAttribute('data-sortable-table');
        const order = Array.from(tbody.querySelectorAll(':scope > tr[data-id]')).map(r => r.getAttribute('data-id'));
        const meta = document.querySelector('meta[name="csrf-token"]');
        const token = meta ? meta.content : '';
        try {
            const res = await fetch('/admin/reorder/' + encodeURIComponent(key), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Accept': 'application/json', 'CSRF-Token': token, 'X-CSRF-Token': token },
                body: JSON.stringify({ _csrf: token, order })
            });
            const data = await res.json().catch(() => ({}));
            if (res.ok && data.success) toast('✓ ¡Orden guardado correctamente!');
            else toast(data.message || 'Error al guardar el orden', false);
        } catch (e) {
            toast('Error al comunicar con el servidor', false);
        }
    }

    function initAll() {
        if (typeof Sortable === 'undefined') return;
        injectStyles();
        document.querySelectorAll('tbody[data-sortable-table]').forEach(tbody => {
            if (tbody.dataset.sortableReady) return;
            tbody.dataset.sortableReady = '1';
            addHandles(tbody);
            Sortable.create(tbody, {
                handle: '.admin-drag-handle',
                draggable: 'tr[data-id]',
                animation: 180,
                ghostClass: 'admin-drag-ghost',
                dragClass: 'admin-drag-active',
                forceFallback: true,
                fallbackOnBody: true,
                scroll: true,
                scrollSensitivity: 120,
                scrollSpeed: 18,
                bubbleScroll: true,
                onEnd: function (evt) {
                    if (evt.oldIndex !== evt.newIndex) persist(tbody);
                }
            });
        });
    }

    function boot() {
        if (!document.querySelector('tbody[data-sortable-table]')) return;
        if (typeof Sortable !== 'undefined') return initAll();
        const s = document.createElement('script');
        s.src = 'https://cdn.jsdelivr.net/npm/sortablejs@1.15.2/Sortable.min.js';
        s.onload = initAll;
        document.head.appendChild(s);
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
    else boot();
    document.addEventListener('shown.bs.tab', boot);
})();
