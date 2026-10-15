// Aro que sigue al cursor morado: se retrasa un poco, crece sobre elementos clicables y se encoge al pulsar.
(function () {
  if (!window.matchMedia('(hover: hover) and (pointer: fine) and (min-width: 901px)').matches) return;

  var ring = document.createElement('div');
  ring.className = 'cursor-ring';
  ring.setAttribute('aria-hidden', 'true');
  document.body.appendChild(ring);

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var HOVER = 'a, button, .btn-primary, .btn-ghost, input, textarea, .testimonial-card, .stack-icon, .brand-logo img, .filter-btn, .polaroid, .work-card, .eg-eyes-float, .meta-pill, .read-more, .gallery-item, .carousel-btn';
  var tx = 0, ty = 0, x = 0, y = 0, raf = 0, first = true;

  function tick() {
    x += (tx - x) * (reduce ? 1 : 0.16);
    y += (ty - y) * (reduce ? 1 : 0.16);
    ring.style.transform = 'translate3d(' + x + 'px,' + y + 'px,0) translate(-50%,-50%)';
    raf = (Math.abs(tx - x) > 0.1 || Math.abs(ty - y) > 0.1) ? requestAnimationFrame(tick) : 0;
  }

  document.addEventListener('mousemove', function (e) {
    tx = e.clientX; ty = e.clientY;
    if (first) { x = tx; y = ty; first = false; }
    ring.classList.add('is-visible');
    if (!raf) raf = requestAnimationFrame(tick);
  });
  document.addEventListener('mouseover', function (e) {
    ring.classList.toggle('is-hover', !!(e.target.closest && e.target.closest(HOVER)));
  });
  document.addEventListener('mousedown', function () { ring.classList.add('is-down'); });
  document.addEventListener('mouseup', function () { ring.classList.remove('is-down'); });
  document.documentElement.addEventListener('mouseleave', function () { ring.classList.remove('is-visible'); });
})();
