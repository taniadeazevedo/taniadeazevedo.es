// Retícula tipo herramienta de diseño sobre el bloque principal del hero (saludo, titular y botón de CV; acaba en la línea de debajo):
// líneas y coordenadas que siguen al cursor y que se enganchan y miden esos elementos. Inspirado en Crosshair de React Bits, en JS puro.
// Solo escritorio con ratón.
(function () {
  var zone = document.querySelector('.hero');
  if (!zone) return;

  var desktop = window.matchMedia('(min-width: 901px) and (hover: hover) and (pointer: fine)');
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var LOCKABLE = 'a, button, .hero-intro, .hero-title';
  var TEXT_BOUNDS = '.hero-intro, .hero-title';
  var PAD = 10;

  var layer = document.createElement('div');
  layer.className = 'crosshair';
  layer.setAttribute('aria-hidden', 'true');
  layer.innerHTML = '<i class="ch-line ch-v1"></i><i class="ch-line ch-v2"></i><i class="ch-line ch-h1"></i><i class="ch-line ch-h2"></i><i class="ch-box"></i><span class="ch-tag"></span>';
  zone.appendChild(layer);
  var v1 = layer.querySelector('.ch-v1'), v2 = layer.querySelector('.ch-v2');
  var h1 = layer.querySelector('.ch-h1'), h2 = layer.querySelector('.ch-h2');
  var box = layer.querySelector('.ch-box'), tag = layer.querySelector('.ch-tag');

  var pointer = { x: 0, y: 0, has: false };
  var lockEl = null, active = false, raf = 0, last = 0, inside = false;
  var cur = null;

  function measure(el, zr) {
    var r;
    if (el.matches(TEXT_BOUNDS)) {
      var range = document.createRange();
      range.selectNodeContents(el);
      r = range.getBoundingClientRect();
    } else {
      r = el.getBoundingClientRect();
    }
    return { l: r.left - zr.left, t: r.top - zr.top, r: r.right - zr.left, b: r.bottom - zr.top };
  }

  // Elige el objetivo cuya caja (texto real o elemento) contiene al puntero; si coinciden varios, el más pequeño
  function pickTarget(x, y, zr) {
    var best = null, bestArea = Infinity;
    [].forEach.call(zone.querySelectorAll(LOCKABLE), function (el) {
      var m = measure(el, zr);
      if (x >= m.l - PAD && x <= m.r + PAD && y >= m.t - PAD && y <= m.b + PAD) {
        var area = (m.r - m.l) * (m.b - m.t);
        if (area < bestArea) { bestArea = area; best = el; }
      }
    });
    return best;
  }

  function frame(now) {
    raf = 0;
    if (!active) return;
    var dt = Math.min(0.05, Math.max(0.001, (now - last) / 1000));
    last = now;
    var zr = zone.getBoundingClientRect();
    var px = pointer.x - zr.left, py = pointer.y - zr.top;

    var t;
    if (lockEl && inside) {
      var m = measure(lockEl, zr);
      t = { v1: m.l, v2: m.r, h1: m.t, h2: m.b, bl: m.l, bt: m.t, bw: m.r - m.l, bh: m.b - m.t,
            tx: m.r, ty: m.b + 8, label: Math.round(m.r - m.l) + ' × ' + Math.round(m.b - m.t) };
    } else {
      t = { v1: px, v2: px, h1: py, h2: py, bl: px, bt: py, bw: 0, bh: 0,
            tx: px + 12, ty: py + 12, label: Math.round(px) + ', ' + Math.round(py) };
    }
    if (!cur) cur = t;
    var k = reduce ? 1 : 1 - Math.exp(-dt * 20);
    var moving = 0;
    ['v1', 'v2', 'h1', 'h2', 'bl', 'bt', 'bw', 'bh', 'tx', 'ty'].forEach(function (key) {
      var d = t[key] - cur[key];
      cur[key] += d * k;
      moving += Math.abs(d);
    });

    v1.style.transform = 'translateX(' + cur.v1.toFixed(1) + 'px)';
    v2.style.transform = 'translateX(' + cur.v2.toFixed(1) + 'px)';
    h1.style.transform = 'translateY(' + cur.h1.toFixed(1) + 'px)';
    h2.style.transform = 'translateY(' + cur.h2.toFixed(1) + 'px)';
    box.style.transform = 'translate(' + cur.bl.toFixed(1) + 'px,' + cur.bt.toFixed(1) + 'px)';
    box.style.width = Math.max(0, cur.bw).toFixed(1) + 'px';
    box.style.height = Math.max(0, cur.bh).toFixed(1) + 'px';
    tag.style.transform = 'translate(' + cur.tx.toFixed(1) + 'px,' + cur.ty.toFixed(1) + 'px)' + (lockEl && inside ? ' translateX(-100%)' : '');
    tag.textContent = t.label;

    // sigue animando mientras el cursor esté dentro (el logo en carrusel se mueve) o falte recorrido
    if (inside || moving > 0.05) raf = requestAnimationFrame(frame);
  }

  function wake() {
    if (raf || !active) return;
    last = performance.now();
    raf = requestAnimationFrame(frame);
  }

  function onMove(e) {
    pointer.x = e.clientX; pointer.y = e.clientY; pointer.has = true;
    var zr = zone.getBoundingClientRect();
    inside = e.clientX >= zr.left && e.clientX <= zr.right && e.clientY >= zr.top && e.clientY <= zr.bottom;
    layer.classList.toggle('is-on', inside);
    document.body.classList.toggle('crosshair-on', inside);
    if (inside) {
      lockEl = pickTarget(e.clientX - zr.left, e.clientY - zr.top, zr);
      layer.classList.toggle('is-locked', !!lockEl);
      if (!cur) { cur = null; }
      wake();
    } else {
      lockEl = null;
      layer.classList.remove('is-locked');
    }
  }
  function onLeave() {
    inside = false; lockEl = null;
    layer.classList.remove('is-on', 'is-locked');
    document.body.classList.remove('crosshair-on');
  }

  function enable() {
    if (active) return;
    active = true; cur = null;
    window.addEventListener('pointermove', onMove, { passive: true });
    document.documentElement.addEventListener('mouseleave', onLeave);
  }
  function disable() {
    if (!active) return;
    active = false;
    cancelAnimationFrame(raf); raf = 0;
    window.removeEventListener('pointermove', onMove);
    document.documentElement.removeEventListener('mouseleave', onLeave);
    onLeave();
  }
  function sync() { if (desktop.matches) enable(); else disable(); }
  sync();
  if (desktop.addEventListener) desktop.addEventListener('change', sync); else desktop.addListener(sync);
})();
