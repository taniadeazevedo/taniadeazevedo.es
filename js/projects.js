// Página "Proyectos": pinta las tarjetas y los filtros a partir de js/projects-data.js, y filtra sin recargar la página.
(function () {
  var data = (window.PROJECTS || []).filter(function (p) { return !p.hidden; });
  var filters = window.PROJECT_FILTERS || [];
  var grid = document.getElementById('v2-archive-grid');
  var bar = document.getElementById('v2-filters');
  var status = document.getElementById('v2-count');
  if (!grid || !bar) return;

  var ROOT = document.documentElement.getAttribute('data-root') || '';   // la página vive en una carpeta: las rutas de la lista se leen desde la raíz de la web
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var ARROW = '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4.5 11.5l7-7M5.5 4.5h6v6"/></svg>';
  function esc(t) { return String(t == null ? '' : t).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

  // ---- tarjetas ----
  grid.innerHTML = data.map(function (p) {
    var ext = p.external ? ' target="_blank" rel="noopener noreferrer"' : '';
    return '<li class="v2-card" data-cats="' + esc((p.cats || []).join(' ')) + '">' +
      '<a class="v2-card-link" href="' + esc(p.external ? p.url : ROOT + p.url) + '"' + ext + '>' +
        '<div class="v2-card-media">' +
          '<img src="' + esc(ROOT + p.image) + '" alt="' + esc(p.alt || p.title) + '" loading="lazy" decoding="async" width="1440" height="990" />' +
        '</div>' +
        '<div class="v2-card-body">' +
          '<p class="v2-card-meta"><span class="v2-card-cat">' + esc(p.label) + '</span></p>' +
          '<h3 class="v2-card-title">' + esc(p.title) + '</h3>' +
          '<p class="v2-card-desc">' + esc(p.desc) + '</p>' +
          '<span class="v2-card-cta">' + esc(p.cta || 'Ver caso de estudio') + ' ' + ARROW + '</span>' +
        '</div>' +
      '</a></li>';
  }).join('');

  // ---- filtros (solo los que tienen al menos un proyecto) ----
  var used = {};
  data.forEach(function (p) { (p.cats || []).forEach(function (c) { used[c] = (used[c] || 0) + 1; }); });
  var shown = filters.filter(function (f) { return f.id === 'todos' || used[f.id]; });
  bar.innerHTML = shown.map(function (f) {
    return '<button type="button" class="v2-filter" data-filter="' + f.id + '" aria-pressed="false">' + esc(f.label) + '</button>';
  }).join('');

  var cards = [].slice.call(grid.children);
  var buttons = [].slice.call(bar.children);
  var current = null;

  function labelOf(id) { var f = shown.filter(function (x) { return x.id === id; })[0]; return f ? f.label : ''; }

  function apply(id, instant) {
    if (!shown.some(function (f) { return f.id === id; })) id = 'todos';
    if (id === current) return;
    current = id;
    buttons.forEach(function (b) { b.setAttribute('aria-pressed', b.getAttribute('data-filter') === id ? 'true' : 'false'); });
    var visible = 0;
    var show = function () {
      cards.forEach(function (li) {
        var match = id === 'todos' || (' ' + li.getAttribute('data-cats') + ' ').indexOf(' ' + id + ' ') > -1;
        li.hidden = !match;
        li.classList.remove('is-out');
        if (match) { li.style.animationDelay = (visible * 55) + 'ms'; visible++; li.classList.remove('is-in'); void li.offsetWidth; if (!reduce) li.classList.add('is-in'); }
      });
      if (status) status.textContent = visible === 1 ? '1 proyecto' : visible + ' proyectos';
    };
    if (instant || reduce) { show(); }
    else { cards.forEach(function (li) { li.classList.add('is-out'); }); setTimeout(show, 160); }
    // la dirección guarda el filtro para poder compartirlo (proyectos/#branding)
    if (!instant) { try { history.replaceState(null, '', id === 'todos' ? location.pathname : '#' + id); } catch (e) {} }
  }

  bar.addEventListener('click', function (e) {
    var b = e.target.closest('.v2-filter'); if (b) apply(b.getAttribute('data-filter'), false);
  });
  window.addEventListener('hashchange', function () { apply(location.hash.slice(1) || 'todos', false); });

  apply(location.hash.slice(1) || 'todos', true);
})();
