// Tema claro/oscuro: usa la elección guardada del visitante y, si no hay, la del sistema. Se carga en <head> para evitar parpadeos.
(function () {
  var KEY = 'theme';
  var root = document.documentElement;
  var mq = window.matchMedia('(prefers-color-scheme: dark)');

  function stored() {
    try { var v = localStorage.getItem(KEY); return v === 'dark' || v === 'light' ? v : null; } catch (e) { return null; }
  }
  function resolve() { return stored() || (mq.matches ? 'dark' : 'light'); }
  function apply(theme) { root.setAttribute('data-theme', theme); }

  apply(resolve());

  document.addEventListener('DOMContentLoaded', function () {
    var btn = document.querySelector('.theme-toggle');
    if (!btn) return;

    function sync() {
      var dark = root.getAttribute('data-theme') === 'dark';
      btn.setAttribute('aria-pressed', String(dark));
      btn.setAttribute('aria-label', dark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro');
    }

    btn.addEventListener('click', function () {
      var next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      apply(next);
      try { localStorage.setItem(KEY, next); } catch (e) {}
      sync();
    });

    // Si el visitante no ha elegido nada, sigue los cambios del sistema en vivo
    var onSystem = function () { if (!stored()) { apply(resolve()); sync(); } };
    if (mq.addEventListener) mq.addEventListener('change', onSystem); else if (mq.addListener) mq.addListener(onSystem);

    sync();
  });
})();
