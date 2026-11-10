// "Más proyectos": al final de cada caso de estudio, 3 proyectos relacionados. Se eligen solos a partir de js/projects-data.js:
// primero los que comparten más categorías con el proyecto actual (el actual no sale), y después el orden de la lista.
(function () {
  var box = document.getElementById('v2-related');
  var data = (window.PROJECTS || []).filter(function (p) { return !p.hidden; });
  if (!box || !data.length) return;
  var ROOT = document.documentElement.getAttribute('data-root') || '';
  var current = box.getAttribute('data-current') || '';          // carpeta del proyecto actual, por ejemplo "open-house-madrid/"
  var me = data.filter(function (p) { return p.url === current; })[0];
  var mine = me ? me.cats || [] : [];
  function esc(t) { return String(t == null ? '' : t).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  var list = data.filter(function (p) { return p.url !== current; }).map(function (p, i) {
    var shared = (p.cats || []).filter(function (c) { return mine.indexOf(c) > -1; }).length;
    return { p: p, i: i, shared: shared };
  }).sort(function (a, b) { return b.shared - a.shared || a.i - b.i; }).slice(0, 3);
  box.innerHTML = list.map(function (x) {
    var p = x.p, ext = p.external ? ' target="_blank" rel="noopener noreferrer"' : '';
    return '<li class="v2-rel-card"><a class="v2-rel-link" href="' + esc(p.external ? p.url : ROOT + p.url) + '"' + ext + '>' +
      '<div class="v2-rel-media"><img src="' + esc(ROOT + p.image) + '" alt="' + esc(p.alt || p.title) + '" loading="lazy" decoding="async" width="1440" height="990" /></div>' +
      '<div class="v2-rel-text"><p class="v2-rel-cat">' + esc(p.label) + '</p><h3 class="v2-rel-title">' + esc(p.title) + '</h3></div>' +
      '</a></li>';
  }).join('');
})();
