// Polaroids con efecto "bounce": entran con rebote al hacer scroll y, al pasar por una, las vecinas se apartan.
// Adaptación en JS puro de BounceCards (física de muelles). Solo escritorio; en móvil/tablet queda la rejilla de CSS.
(function () {
  var wrap = document.querySelector('.polaroid-wrap');
  if (!wrap) return;
  var cards = [].slice.call(wrap.querySelectorAll('.polaroid'));
  if (!cards.length) return;

  var desktop = window.matchMedia('(min-width: 901px) and (hover: hover) and (pointer: fine)');
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Posiciones y giros actuales de la web (desde el centro del contenedor)
  var SLOTS = [
    { x: -360, y: 60, r: 1 },
    { x: -180, y: 0, r: 3 },
    { x: 80, y: -30, r: -3 },
    { x: 300, y: 60, r: 4 }
  ];
  var PUSH = 130, HOVER_SCALE = 1.06, DELAY = 0.12, STAGGER = 0.09, BOUNCINESS = 0.6;

  var bodies = [], hovered = -1, time = 0, shownAt = null, raf = 0, last = 0, k = 1, active = false;

  function slot(i) {
    var s = SLOTS[i] || { x: 0, y: 0, r: 0 };
    return { x: s.x * k, y: s.y, r: s.r };
  }
  function resetBodies() {
    bodies = cards.map(function (_, i) {
      var s = slot(i);
      return { x: s.x, y: s.y, r: s.r, sc: reduce ? 1 : 0, vx: 0, vy: 0, vr: 0, vs: 0 };
    });
  }
  function step(v, vel, target, stiff, damp, dt) {
    var nv = vel + ((target - v) * stiff - vel * damp) * dt;
    return [v + nv * dt, nv];
  }

  function frame(now) {
    raf = 0;
    if (!active) return;
    var dt = Math.min(1 / 30, Math.max(1 / 240, (now - last) / 1000));
    last = now;
    time += dt;

    var popStiff = 170, popDamp = 2 * (1 - 0.85 * BOUNCINESS) * Math.sqrt(popStiff);
    var moveStiff = 210, moveDamp = 2 * (reduce ? 1 : 0.72) * Math.sqrt(moveStiff);
    var n = Math.ceil(dt / (1 / 240)), h = dt / n, moving = 0;
    var push = PUSH * k, cardH = cards[0].offsetHeight || 340;

    cards.forEach(function (el, i) {
      var b = bodies[i], s = slot(i);
      var appeared = reduce || (shownAt !== null && time - shownAt >= DELAY + i * STAGGER);
      var tx = s.x, ty = s.y, tr = s.r, ts = appeared ? 1 : 0;
      if (hovered >= 0 && appeared) {
        if (i === hovered) { ty = s.y - cardH * 0.04; tr = 0; ts = HOVER_SCALE; }
        else { tx = s.x + (i > hovered ? 1 : -1) * push; }
      }
      for (var j = 0; j < n; j++) {
        var a;
        a = step(b.x, b.vx, tx, moveStiff, moveDamp, h); b.x = a[0]; b.vx = a[1];
        a = step(b.y, b.vy, ty, moveStiff, moveDamp, h); b.y = a[0]; b.vy = a[1];
        a = step(b.r, b.vr, tr, moveStiff, moveDamp, h); b.r = a[0]; b.vr = a[1];
        if (reduce) { b.sc = ts; b.vs = 0; }
        else { a = step(b.sc, b.vs, ts, popStiff, popDamp, h); b.sc = a[0]; b.vs = a[1]; }
      }
      moving += Math.abs(b.vx) + Math.abs(b.vy) + Math.abs(b.vr) + Math.abs(b.vs) * 100 +
        Math.abs(tx - b.x) + Math.abs(ty - b.y) + Math.abs(tr - b.r) + Math.abs(ts - b.sc) * 100 +
        (appeared ? 0 : (shownAt !== null ? 1 : 0));
      el.style.transform = 'translate3d(' + b.x.toFixed(2) + 'px,' + b.y.toFixed(2) + 'px,0) rotate(' + b.r.toFixed(3) + 'deg) scale(' + Math.max(0, b.sc).toFixed(4) + ')';
      el.style.zIndex = i === hovered ? '20' : String(i + 1);
      if (i === hovered) el.setAttribute('data-active', ''); else el.removeAttribute('data-active');
    });

    if (moving > 0.02) raf = requestAnimationFrame(frame);
  }
  function wake() {
    if (raf || !active) return;
    last = performance.now();
    raf = requestAnimationFrame(frame);
  }

  function pick(e) {
    var rect = wrap.getBoundingClientRect();
    var px = e.clientX - rect.left - rect.width / 2;
    var py = e.clientY - rect.top - rect.height / 2;
    var halfW = (cards[0].offsetWidth || 260) / 2, halfH = (cards[0].offsetHeight || 340) / 2;
    var best = -1, dist = Infinity;
    cards.forEach(function (_, i) {
      var g = Math.abs(px - slot(i).x);
      if (g < dist) { dist = g; best = i; }
    });
    if (best < 0 || Math.abs(py - slot(best).y) > halfH + 8 || dist > halfW + 8) return -1;
    if (hovered >= 0 && hovered !== best && Math.abs(px - slot(hovered).x) - dist < 6) return hovered;
    return best;
  }
  function onMove(e) {
    var next = pick(e);
    if (next !== hovered) { hovered = next; wake(); }
  }
  function onLeave() { if (hovered !== -1) { hovered = -1; wake(); } }

  // Respaldo por scroll por si IntersectionObserver no avisa: las fotos nunca se quedan ocultas
  function reveal() {
    if (shownAt === null) { shownAt = time; wake(); }
    window.removeEventListener('scroll', checkVisible);
  }
  function checkVisible() {
    var r = wrap.getBoundingClientRect(), vh = window.innerHeight || document.documentElement.clientHeight;
    var visible = Math.min(r.bottom, vh) - Math.max(r.top, 0);
    if (r.height > 0 && visible / r.height >= 0.3) reveal();
  }

  var observer = null;
  function enable() {
    if (active) return;
    active = true;
    k = Math.min(1, wrap.clientWidth / 1200);
    wrap.classList.add('bounce-on');
    resetBodies();
    time = 0; shownAt = null; hovered = -1;
    cards.forEach(function (el, i) {
      var b = bodies[i];
      el.style.transform = 'translate3d(' + b.x + 'px,' + b.y + 'px,0) rotate(' + b.r + 'deg) scale(' + b.sc + ')';
    });
    window.addEventListener('pointermove', onMove, { passive: true });
    document.documentElement.addEventListener('mouseleave', onLeave);
    if ('IntersectionObserver' in window) {
      observer = new IntersectionObserver(function (entries) {
        if (entries[0].isIntersecting) reveal();
      }, { threshold: 0.3 });
      observer.observe(wrap);
    }
    window.addEventListener('scroll', checkVisible, { passive: true });
    checkVisible();
    wake();
  }
  function disable() {
    if (!active) return;
    active = false;
    cancelAnimationFrame(raf); raf = 0;
    window.removeEventListener('pointermove', onMove);
    document.documentElement.removeEventListener('mouseleave', onLeave);
    window.removeEventListener('scroll', checkVisible);
    if (observer) { observer.disconnect(); observer = null; }
    wrap.classList.remove('bounce-on');
    cards.forEach(function (el) {
      el.style.transform = ''; el.style.zIndex = ''; el.removeAttribute('data-active');
    });
  }

  function sync() { if (desktop.matches) enable(); else disable(); }
  sync();
  if (desktop.addEventListener) desktop.addEventListener('change', sync); else desktop.addListener(sync);
  window.addEventListener('resize', function () { if (active) { k = Math.min(1, wrap.clientWidth / 1200); wake(); } });
})();
