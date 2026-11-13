// Rediseño v2: cabecera que se recoge en píldora, menú móvil, enlace activo, brillo que sigue al cursor en el hero
// y texto que se ilumina palabra a palabra al hacer scroll.
(function () {
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- 1. Cabecera: píldora al bajar ---------- */
  var nav = document.getElementById('v2-nav');
  var PILL_AT = 70;                                    // píxeles de scroll a partir de los que se recoge
  function onNavScroll() { if (nav) nav.classList.toggle('is-pill', (window.scrollY || 0) > PILL_AT); }

  /* ---------- 2. Menú móvil ---------- */
  var burger = document.getElementById('v2-burger');
  var menu = document.getElementById('v2-menu');
  function setMenu(open) {
    if (!burger || !menu) return;
    menu.classList.toggle('is-open', open);
    document.documentElement.classList.toggle('v2-menu-open', open);
    burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    burger.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
    document.documentElement.style.overflow = open ? 'hidden' : '';
    menu.setAttribute('aria-hidden', open ? 'false' : 'true');
  }
  if (burger && menu) {
    burger.addEventListener('click', function () { setMenu(!menu.classList.contains('is-open')); });
    menu.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') setMenu(false); });
    window.addEventListener('resize', function () { if (window.innerWidth > 900) setMenu(false); });
  }

  /* ---------- 3. Enlace activo según la sección en la que se está ---------- */
  var links = [].slice.call(document.querySelectorAll('.v2-links a'));
  var targets = links.map(function (a) { var h = a.getAttribute('href') || ''; return h.charAt(0) === '#' ? { a: a, el: document.getElementById(h.slice(1)) } : null; })
    .filter(function (t) { return t && t.el; });
  function onActive() {
    if (!targets.length) return;   // en otras páginas (como Proyectos) el enlace activo lo marca aria-current
    // gana la última sección cuyo borde superior ya ha pasado por el 40% de la pantalla
    var sy = window.scrollY || 0, line = sy + window.innerHeight * 0.4, current = null, best = -1;
    // se elige la sección que empieza más abajo sin pasar de esa línea (así no depende del orden del menú)
    targets.forEach(function (t) { var top = t.el.getBoundingClientRect().top + sy; if (top <= line && top > best) { best = top; current = t; } });
    links.forEach(function (a) { a.classList.toggle('is-active', !!current && a === current.a); });
  }

  /* ---------- 4. Brillo del hero que sigue al cursor ---------- */
  var card = document.querySelector('.v2-hero-card');
  if (card && !reduce && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    card.addEventListener('pointermove', function (e) {
      var r = card.getBoundingClientRect();
      card.style.setProperty('--mx', (e.clientX - r.left) + 'px');
      card.style.setProperty('--my', (e.clientY - r.top) + 'px');
    });
  }

  /* ---------- 5. Texto que se ilumina con el scroll ---------- */
  var blocks = [].slice.call(document.querySelectorAll('[data-reveal]'));
  var words = [];                                      // { el, y, x, tone }
  var VER = document.documentElement.getAttribute('data-t');   // paleta de la home: 'oscuro' (suave) o 'lila' (claro)
  var DIM = VER === 'lila' ? [29, 21, 48, 0.16] : VER === 'oscuro' ? [243, 237, 228, 0.16] : [246, 242, 255, 0.16];   // color apagado
  var TONES = VER === 'lila' ? { white: [29, 21, 48, 1], lilac: [106, 63, 196, 1] } : VER === 'oscuro' ? { white: [243, 237, 228, 1], lilac: [183, 168, 214, 1] } : { white: [246, 242, 255, 1], lilac: [201, 168, 251, 1] };

  function splitWords(root) {
    // recorre los nodos de texto y envuelve cada palabra en un <span class="w">, respetando <em>
    var walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    var nodes = []; while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach(function (node) {
      var parts = node.nodeValue.split(/(\s+)/);
      var frag = document.createDocumentFragment();
      parts.forEach(function (p) {
        if (!p) return;
        if (/^\s+$/.test(p)) { frag.appendChild(document.createTextNode(' ')); return; }
        var s = document.createElement('span'); s.className = 'w'; s.textContent = p;
        frag.appendChild(s);
        words.push({ el: s, y: 0, x: 0, tone: node.parentElement.closest('em') ? 'lilac' : 'white' });
      });
      node.parentNode.replaceChild(frag, node);
    });
  }

  function measure() {
    var sy = window.scrollY || 0;
    blocks.forEach(function (b) { b.__r = b.getBoundingClientRect(); b.__top = b.__r.top + sy; });
    words.forEach(function (w) {
      var r = w.el.getBoundingClientRect(), b = w.el.closest('[data-reveal]');
      w.y = r.top + sy;
      w.x = b && b.__r.width ? Math.min(1, Math.max(0, (r.left - b.__r.left) / b.__r.width)) : 0;
    });
  }

  function paint() {
    var sy = window.scrollY || 0, vh = window.innerHeight;
    words.forEach(function (w) {
      // la palabra empieza a iluminarse cuando entra por debajo (86% de la pantalla) y acaba al llegar al 52%;
      // un pequeño desfase según su posición en la línea hace que se enciendan de izquierda a derecha
      var t = w.y - sy + w.x * 34;
      var p = (vh * 0.86 - t) / (vh * 0.34);
      p = p < 0 ? 0 : p > 1 ? 1 : p;
      var to = TONES[w.tone];
      w.el.style.color = 'rgba(' + Math.round(DIM[0] + (to[0] - DIM[0]) * p) + ',' + Math.round(DIM[1] + (to[1] - DIM[1]) * p) + ',' + Math.round(DIM[2] + (to[2] - DIM[2]) * p) + ',' + (DIM[3] + (to[3] - DIM[3]) * p).toFixed(3) + ')';
    });
  }

  var ticking = false;
  function onScroll() {
    onNavScroll(); onActive();
    if (!words.length || ticking) return;
    ticking = true;
    requestAnimationFrame(function () { paint(); ticking = false; });
  }

  if (blocks.length && !reduce) {
    document.documentElement.classList.add('js-reveal');
    blocks.forEach(splitWords);
    measure(); paint();
    window.addEventListener('resize', function () { measure(); paint(); });
    window.addEventListener('load', function () { measure(); paint(); });
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { measure(); paint(); });
  }


  /* ---------- 6. Stack del hero: los iconos se agrandan al acercar el cursor (efecto dock) ---------- */
  var dock = document.getElementById('v2-dock');
  if (dock && !reduce && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    var items = [].slice.call(dock.children);
    var BASE = 32, PEAK = 44, RADIUS = 78;             // tamaño normal, tamaño máximo y alcance (px) del efecto
    var cur = items.map(function () { return BASE; });
    var tgt = items.map(function () { return BASE; });
    var running = false, px = null;

    function dockTargets() {
      // el centro de cada icono se calcula con su tamaño en reposo, para que el efecto no "huya" del cursor
      var left = dock.getBoundingClientRect().left, x = left;
      items.forEach(function (li, i) {
        var center = x + BASE / 2;
        var d = px === null ? RADIUS : Math.min(Math.abs(px - center), RADIUS);
        tgt[i] = BASE + (PEAK - BASE) * (1 + Math.cos(Math.PI * d / RADIUS)) / 2;
        x += BASE + 6;
      });
    }
    function tick() {
      var moving = false;
      items.forEach(function (li, i) {
        var d = tgt[i] - cur[i];
        if (Math.abs(d) > 0.05) { cur[i] += d * 0.28; moving = true; } else { cur[i] = tgt[i]; }
        li.style.setProperty('--size', cur[i].toFixed(2) + 'px');
      });
      if (moving) requestAnimationFrame(tick); else running = false;
    }
    function go() { if (!running) { running = true; requestAnimationFrame(tick); } }
    dock.addEventListener('pointermove', function (e) { px = e.clientX; dockTargets(); go(); });
    dock.addEventListener('pointerleave', function () { px = null; dockTargets(); go(); });
  }

  /* vídeo de fondo del hero: con «reducir movimiento» se queda parado en el primer fotograma */
  var hv = document.getElementById('v2-hero-video');
  // Si el navegador no deja reproducir solo (p. ej. el modo de bajo consumo del iPhone), se esconde el vídeo
  // (así no sale el botón de play) y se queda la foto de fondo (hero-poster.jpg, puesta en el CSS).
  if (hv) {
    var ocultarVideo = function () { hv.style.visibility = 'hidden'; };
    var mostrarVideo = function () { hv.style.visibility = 'visible'; };
    var intentar = function () { var p = hv.play && hv.play(); if (p && p.then) { p.then(mostrarVideo).catch(ocultarVideo); } };
    hv.muted = true; hv.setAttribute('playsinline', ''); hv.setAttribute('webkit-playsinline', '');
    intentar();
    // si a los 2,5 s sigue parado, se esconde; y al primer toque o scroll del usuario se vuelve a intentar (iOS sí deja entonces)
    setTimeout(function () { if (hv.paused) ocultarVideo(); }, 2500);
    ['touchstart', 'pointerdown', 'scroll'].forEach(function (ev) { window.addEventListener(ev, function reintento() { window.removeEventListener(ev, reintento); if (hv.paused && !reduce) intentar(); }, { passive: true }); });
    hv.addEventListener('playing', mostrarVideo);
  }
  if (hv && reduce) { hv.removeAttribute('autoplay'); hv.pause(); hv.style.visibility = 'hidden'; }
  // con ahorro de datos o una conexión lenta no se descarga el vídeo del hero (se queda el fondo degradado)
  var net = navigator.connection;
  if (hv && net && (net.saveData || /(^|-)2g$|3g/.test(net.effectiveType || ''))) { hv.pause(); hv.removeAttribute('autoplay'); [].slice.call(hv.querySelectorAll('source')).forEach(function (s) { s.remove(); }); hv.removeAttribute('src'); hv.load(); }

  /* ---------- 7. Vídeos de fondo de los proyectos: se cargan y reproducen solo cuando están cerca de la pantalla ---------- */
  var vids = [].slice.call(document.querySelectorAll('video[data-src]'));
  if (vids.length && 'IntersectionObserver' in window && !reduce) {
    var vio = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        var v = en.target;
        if (en.isIntersecting) {
          if (!v.getAttribute('src')) v.setAttribute('src', v.getAttribute('data-src'));
          var pr = v.play(); if (pr && pr.catch) pr.catch(function () {});
        } else { v.pause(); }
      });
    }, { rootMargin: '200px 0px' });
    vids.forEach(function (v) { vio.observe(v); });
  }

  /* ---------- 8. Testimonios: una cita grande cada vez, con flechas, teclado y gesto de arrastrar ---------- */
  (function () {
    var quotes = [].slice.call(document.querySelectorAll('.v2-quote'));
    var stage = document.getElementById('v2-quotes-stage');
    var prev = document.getElementById('v2-quotes-prev'), next = document.getElementById('v2-quotes-next'), count = document.getElementById('v2-quotes-count');
    if (quotes.length < 2 || !stage) return;
    var cur = 0;
    function pad(n) { return (n < 10 ? '0' : '') + n; }
    function show(i) {
      cur = (i + quotes.length) % quotes.length;
      quotes.forEach(function (q, k) {
        var on = k === cur;
        q.classList.toggle('is-active', on);
        q.setAttribute('aria-hidden', on ? 'false' : 'true');
        var a = q.querySelector('a'); if (a) a.tabIndex = on ? 0 : -1;
      });
      if (count) count.textContent = pad(cur + 1) + ' / ' + pad(quotes.length);
    }
    if (prev) prev.addEventListener('click', function () { show(cur - 1); });
    if (next) next.addEventListener('click', function () { show(cur + 1); });
    var section = document.getElementById('testimonials');
    if (section) section.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowLeft') { show(cur - 1); } else if (e.key === 'ArrowRight') { show(cur + 1); }
    });
    var x0 = null;
    stage.addEventListener('pointerdown', function (e) { x0 = e.clientX; });
    stage.addEventListener('pointerup', function (e) {
      if (x0 === null) return;
      var dx = e.clientX - x0; x0 = null;
      if (Math.abs(dx) > 50) show(cur + (dx < 0 ? 1 : -1));
    });
  })();

  window.addEventListener('scroll', onScroll, { passive: true });
  onNavScroll(); onActive();
})();


// Subtítulo del hero: la última palabra se escribe letra a letra, se selecciona, se borra y escribe la siguiente.
(function () {
  var el = document.querySelector('.v2-type');
  if (!el) return;
  var words = (el.getAttribute('data-words') || '').split('|').map(function (w) { return w + '.'; });
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce || words.length < 2) return;                 // con «reducir movimiento» se queda la primera palabra quieta

  var text = document.createElement('span');               // aquí va el texto que se escribe
  var caret = document.createElement('span'); caret.className = 'v2-caret-t';
  el.textContent = ''; el.appendChild(text); el.appendChild(caret);
  var i = 0;

  function wait(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }
  async function typeWord(w) {
    for (var k = 1; k <= w.length; k++) { text.textContent = w.slice(0, k); await wait(70); }
  }
  async function loop() {
    text.textContent = words[0];
    await wait(2600);                                      // la primera palabra se queda un rato
    while (true) {
      caret.classList.add('is-off'); text.classList.add('v2-type-sel');   // se selecciona la palabra
      await wait(650);
      text.textContent = ''; text.classList.remove('v2-type-sel'); caret.classList.remove('is-off');   // se borra
      await wait(260);
      i = (i + 1) % words.length;
      await typeWord(words[i]);                            // y se escribe la siguiente
      await wait(2200);
    }
  }
  loop();
})();


// Carrusel de logotipos: avanza solo, se para al pasar el cursor y se puede arrastrar (al soltar, sigue con la inercia del gesto).
(function () {
  var view = document.querySelector('.v2-brands-view');
  var track = view && view.querySelector('.v2-brands-grid');
  if (!track) return;
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;   // en ese caso se queda estático

  var BASE = -30;                                     // velocidad en reposo (píxeles por segundo; negativa = hacia la izquierda)
  var x = 0, v = BASE, prev = 0, hover = false, dragging = false, lastX = 0, lastT = 0, visible = true, half = 0;

  function measure() { half = track.scrollWidth / 2; }     // la lista está duplicada: al recorrer la mitad, vuelve a empezar sin saltos
  measure();
  window.addEventListener('resize', measure);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(measure);
  window.addEventListener('load', measure);

  view.addEventListener('pointerenter', function (e) { if (e.pointerType === 'mouse') hover = true; });
  view.addEventListener('pointerleave', function (e) { if (e.pointerType === 'mouse') hover = false; });

  view.addEventListener('pointerdown', function (e) {
    dragging = true; lastX = e.clientX; lastT = performance.now();
    view.classList.add('is-drag');
    try { view.setPointerCapture(e.pointerId); } catch (err) {}
  });
  view.addEventListener('pointermove', function (e) {
    if (!dragging) return;
    var now = performance.now(), dx = e.clientX - lastX, dt = Math.max(1, now - lastT);
    x += dx;
    v = Math.max(-2400, Math.min(2400, dx / dt * 1000));   // velocidad del gesto, en píxeles por segundo
    lastX = e.clientX; lastT = now;
  });
  function end() { dragging = false; view.classList.remove('is-drag'); }
  view.addEventListener('pointerup', end);
  view.addEventListener('pointercancel', end);
  view.addEventListener('dragstart', function (e) { e.preventDefault(); });

  if ('IntersectionObserver' in window) new IntersectionObserver(function (en) { visible = en[0].isIntersecting; }, { rootMargin: '100px' }).observe(view);

  function frame(now) {
    var dt = Math.min(0.05, (now - (prev || now)) / 1000); prev = now;   // segundos desde el fotograma anterior (así va igual en pantallas de 60 y 120 Hz)
    if (visible) {
      if (!dragging) {
        var target = hover ? 0 : BASE;                  // con el cursor encima se frena; si no, vuelve poco a poco a su ritmo
        v += (target - v) * (1 - Math.exp(-dt * 3));
        x += v * dt;
      }
      if (half) { x = ((x % half) - half) % half; }     // se mantiene dentro de una vuelta
      track.style.transform = 'translate3d(' + x.toFixed(2) + 'px,0,0)';
    }
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
})();

// Botón flotante de WhatsApp (en todas las páginas). El número y el mensaje inicial se cambian aquí.
(function () {
  var NUMERO = '34634756022';                          // con prefijo del país y sin + ni espacios
  var MENSAJE = 'Hola Tania, te escribo desde tu portafolio.';
  var url = 'https://wa.me/' + NUMERO + '?text=' + encodeURIComponent(MENSAJE);
  var a = document.createElement('a');
  a.className = 'v2-wa';
  a.href = url; a.target = '_blank'; a.rel = 'noopener noreferrer';
  a.setAttribute('aria-label', 'Escríbeme por WhatsApp');
  a.innerHTML = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg><span class="v2-wa-tip" aria-hidden="true">Escríbeme por WhatsApp</span>';
  document.body.appendChild(a);
  // el enlace de WhatsApp del bloque de contacto usa el mismo número
  var link = document.getElementById('v2-wa-link'); if (link) link.href = url;
})();
