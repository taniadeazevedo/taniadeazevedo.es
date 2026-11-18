/* ============================================================
   AVISOS AL MÓVIL (ntfy): te llega una notificación cuando alguien visita tu portfolio.
   Igual que el aviso de la propuesta de MSF. No se guarda nada de la persona: solo se avisa de la acción
   (abrir, ver proyectos, descargar el CV, llegar a Contacto, pulsar WhatsApp/mail/LinkedIn) y del tipo de dispositivo.
   Para no avisarte de tus propias visitas: abre una vez https://taniadeazevedo.es/?soyyo en cada dispositivo tuyo.
   ============================================================ */
(() => {
  const CANAL = 'https://ntfy.sh/tania-web-6e751f323a59';                                  // canal de avisos (el mismo nombre se escribe en la app ntfy)

  const local = /localhost|127\.0\.0\.1/.test(location.hostname);           // ¿estás probando en tu ordenador?
  const forzar = local && location.search.includes('avisos=forzar');        // solo en local: ?avisos=forzar permite probar los avisos
  try {                                                                    // si el navegador bloquea el almacenamiento, no pasa nada
    if (new URLSearchParams(location.search).has('soyyo')) {               // si entras con ?soyyo…
      localStorage.setItem('web-soyyo', '1');                              // …este dispositivo queda marcado como tuyo
      history.replaceState(null, '', location.pathname);                   // y se limpia la dirección
    }
    if (localStorage.getItem('web-soyyo')) return;                         // eres tú: no se avisa de nada
  } catch (e) {}
  if ((local && !forzar) || location.protocol === 'file:') return;         // pruebas en local: sin avisos
  if (navigator.webdriver || /bot|crawl|spider|headless|lighthouse|preview|facebookexternalhit|slurp/i.test(navigator.userAgent)) return; // robots y buscadores: no cuentan

  const disp = /Mobi|Android|iPhone/i.test(navigator.userAgent) ? 'móvil' : 'ordenador'; // tipo de dispositivo
  let enviados = 0;                                                        // límite de avisos por visita (por si algo se repite)
  const avisar = (clave, titulo, texto, emoji) => {                        // manda un aviso, una sola vez por visita y por clave
    if (enviados >= 8) return;                                             // máximo 8 avisos por visita
    try { if (sessionStorage.getItem('aviso-' + clave)) return; sessionStorage.setItem('aviso-' + clave, '1'); } catch (e) {}
    enviados++;                                                            // se cuenta este aviso
    const url = CANAL + '?title=' + encodeURIComponent(titulo) + '&tags=' + (emoji || 'eyes'); // título y emoji del aviso
    const cuerpo = texto + ' · ' + disp;                                   // detalle: qué y desde qué dispositivo
    if (!(navigator.sendBeacon && navigator.sendBeacon(url, cuerpo)))      // sendBeacon llega aunque se cierre la página
      fetch(url, { method: 'POST', body: cuerpo, keepalive: true }).catch(() => {}); // plan B
  };

  // 1) AL ABRIR UNA PÁGINA: avisa de cuál es y de dónde viene (solo el nombre del sitio, p. ej. linkedin.com)
  let origen = '';                                                         // de dónde llega la visita
  try { origen = document.referrer ? new URL(document.referrer).hostname.replace(/^www\./, '') : ''; } catch (e) {}
  if (origen === location.hostname) origen = '';                           // si viene de otra página de tu web, no se cuenta
  const pagina = document.title.split('–')[0].split('·')[0].trim() || 'tu web'; // nombre corto de la página
  const esInicio = location.pathname === '/' || /index\.html?$/.test(location.pathname) && location.pathname.split('/').filter(Boolean).length <= 1;
  avisar('abre-' + location.pathname,
    esInicio ? 'Han abierto tu portfolio' : 'Están viendo: ' + pagina,
    'taniadeazevedo.es' + location.pathname + (origen ? ' · viene de ' + origen : ''));

  // 2) AL LLEGAR A UNA SECCIÓN (se cuenta cuando se ve al menos la mitad)
  const secciones = { proyectos: ['Están mirando tus proyectos', 'Bajaron hasta Proyectos destacados'],
                      experience: ['Están leyendo tu experiencia', 'Bajaron hasta Experiencia'],
                      contact: ['Han llegado a Contacto', 'Bajaron hasta el formulario de contacto'] };
  if ('IntersectionObserver' in window) {
    Object.keys(secciones).forEach(id => {
      const el = document.getElementById(id);                              // la sección con ese id
      if (!el) return;                                                     // si esta página no la tiene, se salta
      new IntersectionObserver((entradas, obs) => {
        if (entradas[0].isIntersecting) { avisar('sec-' + id, secciones[id][0], secciones[id][1]); obs.disconnect(); }
      }, { threshold: 0.4 }).observe(el);
    });
  }

  // 3) AL PULSAR ALGO IMPORTANTE: CV, WhatsApp, tu email o LinkedIn
  document.addEventListener('click', e => {
    const a = e.target.closest && e.target.closest('a[href]');             // el enlace pulsado
    if (!a) return;
    const h = a.getAttribute('href') || '';                                // y su destino
    if (/\.pdf(\?|$)/i.test(h)) avisar('cv', 'Han descargado tu CV', 'CV en PDF', 'page_facing_up');
    else if (/wa\.me|whatsapp/i.test(h)) avisar('wa', 'Te han pulsado WhatsApp', 'Botón de WhatsApp', 'speech_balloon');
    else if (/^mailto:taniadeazevedoribeiro@/i.test(h)) avisar('mail', 'Han pulsado tu email', 'Enlace a tu correo', 'e-mail');
    else if (/linkedin\.com/i.test(h)) avisar('linkedin', 'Han abierto tu LinkedIn', 'Enlace a LinkedIn', 'briefcase');
  }, true);
})();
