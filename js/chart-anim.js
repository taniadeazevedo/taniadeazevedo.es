// Animación suave de los gráficos de "El festival en cifras" (Madrid y Málaga), "El torneo en cifras" (Estrella Damm)
// y las tarjetas de "Lo que no se ve" de Calcula lo tuyo.
// Cada tarjeta anima sus gráficos una sola vez, cuando entra en pantalla. Si la persona tiene activado "reducir movimiento",
// o el navegador no soporta IntersectionObserver, no hace nada y los gráficos se ven ya completos.
(function () {
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce || !('IntersectionObserver' in window)) return;

  var cards = document.querySelectorAll('.ohm-card, .om-card, .ed-card, .lv-card, .card');
  if (!cards.length) return;

  var EASE = 'cubic-bezier(0.22, 0.61, 0.36, 1)';

  cards.forEach(function (card) {
    var plays = []; // acciones que se lanzan cuando la tarjeta entra en pantalla

    // Deja el elemento en su estado inicial y guarda cómo llegar al final (con retraso y duración propios)
    function prep(el, from, to, props, dur, delay) {
      Object.keys(from).forEach(function (k) { el.style[k] = from[k]; });
      plays.push(function () {
        el.style.transition = props.map(function (p) { return p + ' ' + dur + 'ms ' + EASE + ' ' + delay + 'ms'; }).join(', ');
        Object.keys(to).forEach(function (k) { el.style[k] = to[k]; });
      });
    }

    // Barras horizontales: crecen desde la izquierda hasta su ancho
    card.querySelectorAll('.ohm-track i, .ed-track i, .bar-track i, .lv-track i').forEach(function (el, i) {
      var w = el.style.width;
      if (w) prep(el, { width: '0' }, { width: w }, ['width'], 1100, i * 120);
    });

    // Barras partidas (reparto de premios, actividades): se despliegan de izquierda a derecha
    card.querySelectorAll('.ed-stack i, .om-seg i, .lv-seg i').forEach(function (el, i) {
      prep(el, { transform: 'scaleX(0)', transformOrigin: 'left center' }, { transform: 'scaleX(1)' }, ['transform'], 800, i * 140);
    });

    // Columnas: suben desde la base
    card.querySelectorAll('.om-cols i').forEach(function (el, i) {
      var h = el.style.height;
      if (h) prep(el, { height: '0' }, { height: h }, ['height'], 1000, i * 160);
    });

    // Barritas de envíos: aparecen una a una desde abajo
    card.querySelectorAll('.ohm-sends i, .ed-sends i').forEach(function (el, i) {
      prep(el, { transform: 'scaleY(0)', transformOrigin: 'bottom center' }, { transform: 'scaleY(1)' }, ['transform'], 500, i * 45);
    });

    // Puntos y pantallas: se encienden en cascada
    var dots = card.querySelectorAll('.ohm-dots circle, .ed-dots circle, .om-screens rect');
    dots.forEach(function (el, i) {
      var delay = Math.min(i * (900 / dots.length), 900);
      prep(el, { opacity: '0', transform: 'scale(0.4)', transformBox: 'fill-box', transformOrigin: 'center' },
        { opacity: '1', transform: 'scale(1)' }, ['opacity', 'transform'], 500, delay);
    });

    // Anillos y medio anillo: el trazo se rellena hasta su valor
    card.querySelectorAll('.val').forEach(function (el) {
      var da = el.getAttribute('stroke-dasharray');
      if (!da) return;
      var parts = da.split(' ');
      prep(el, { strokeDasharray: '0 ' + (parts[1] || '100') }, { strokeDasharray: da }, ['stroke-dasharray'], 1300, 150);
    });

    // Mini gráficos del bloque de la web de Málaga: aparecen en fila
    card.querySelectorAll('.om-trio svg').forEach(function (el, i) {
      prep(el, { opacity: '0' }, { opacity: '1' }, ['opacity'], 600, i * 160);
    });

    // Línea de tiempo: los hitos aparecen en orden
    card.querySelectorAll('.ed-step').forEach(function (el, i) {
      prep(el, { opacity: '0', transform: 'translateY(10px)' }, { opacity: '1', transform: 'translateY(0)' }, ['opacity', 'transform'], 600, i * 170);
    });

    if (!plays.length) return;

    var observer = new IntersectionObserver(function (entries) {
      if (!entries[0].isIntersecting) return;
      observer.disconnect();
      void card.offsetWidth; // fuerza al navegador a pintar el estado inicial antes de animar
      plays.forEach(function (play) { play(); });
    }, { threshold: 0.2 });
    observer.observe(card);
  });
})();
