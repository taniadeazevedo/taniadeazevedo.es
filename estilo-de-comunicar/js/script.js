(function () {
  'use strict';

  /* ── 1. IntersectionObserver reveal ── */
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        el.classList.add('is-visible');
        if (el.classList.contains('hero-title')) {
          var em = el.querySelector('em');
          if (em) em.classList.add('is-visible');
        }
        io.unobserve(el);
      });
    }, { rootMargin: '0px 0px -7% 0px', threshold: 0.07 });

    document.querySelectorAll('.reveal').forEach(function (el, i) {
      if (!el.hasAttribute('data-delay')) {
        var cycle = i % 5;
        if (cycle > 0) el.setAttribute('data-delay', String(cycle));
      }
      io.observe(el);
    });
  } else {
    document.querySelectorAll('.reveal').forEach(function (el) {
      el.classList.add('is-visible');
    });
  }

  /* ── 2. Header scrolled ── */
  var header = document.getElementById('site-header');
  if (header) {
    function onScroll() { header.classList.toggle('scrolled', window.scrollY > 36); }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ── 3. Bento & Step spotlight ── */
  function addSpotlight(selector) {
    document.querySelectorAll(selector).forEach(function (card) {
      card.addEventListener('mousemove', function (e) {
        var rect = card.getBoundingClientRect();
        card.style.setProperty('--sx', ((e.clientX - rect.left) / rect.width * 100).toFixed(1) + '%');
        card.style.setProperty('--sy', ((e.clientY - rect.top) / rect.height * 100).toFixed(1) + '%');
      });
      card.addEventListener('mouseleave', function () {
        card.style.setProperty('--sx', '50%');
        card.style.setProperty('--sy', '50%');
      });
    });
  }
  addSpotlight('.bento-item');
  addSpotlight('.step-card');

  /* ── 4. Parallax orbs ── */
  if (window.matchMedia('(prefers-reduced-motion: no-preference)').matches && window.innerWidth > 900) {
    var heroOrbs = document.querySelectorAll('.hero .orb');
    var stylesOrbs = document.querySelectorAll('.styles-orb');
    var raf = false;
    window.addEventListener('scroll', function () {
      if (raf) return;
      raf = true;
      requestAnimationFrame(function () {
        var y = window.scrollY;
        heroOrbs.forEach(function (orb, i) {
          orb.style.transform = 'translateY(' + (y * [0.055,0.038,0.025][i]) + 'px)';
        });
        stylesOrbs.forEach(function (orb, i) {
          orb.style.transform = 'translateY(' + (y * [-.03,.02][i]) + 'px)';
        });
        raf = false;
      });
    }, { passive: true });
  }

  /* ── 5. Animal tilt ── */
  document.querySelectorAll('.animal-card').forEach(function (card) {
    card.addEventListener('mousemove', function (e) {
      var rect = card.getBoundingClientRect();
      var dx = (e.clientX - rect.left - rect.width / 2) / (rect.width / 2);
      var dy = (e.clientY - rect.top - rect.height / 2) / (rect.height / 2);
      card.style.transform = 'translateY(-10px) scale(1.015) rotateX(' + (-dy * 4) + 'deg) rotateY(' + (dx * 4) + 'deg)';
      card.style.transition = 'transform 80ms linear, box-shadow 380ms var(--ease-expo), background 380ms var(--ease-smooth), border-color 380ms var(--ease-smooth)';
    });
    card.addEventListener('mouseleave', function () {
      card.style.transform = '';
      card.style.transition = '';
    });
  });

  /* ══════════════════════════════════════════════════
     6. TABLA DINÁMICA DE COMPATIBILIDAD
  ══════════════════════════════════════════════════ */

  var compat = {
    /* ─── DELFÍN ─── */
    'delfin-delfin': {
      type: 'tension',
      icon: '⚡',
      badge: 'Tensión creativa',
      title: 'Dos Delfines: energía desbordante, estructura en riesgo',
      desc: 'La conversación explota de ideas y entusiasmo — pero puede irse por las ramas sin llegar a ningún puerto. La magia ocurre si alguien frena para consolidar. La trampa: ninguno lo hará de forma natural.',
      tip: 'Acuerda al inicio quién hace de "ancla de foco" en esa reunión. Rota el rol.'
    },
    'delfin-buho': {
      type: 'equilibrio',
      icon: '⚖️',
      badge: 'Equilibrio potente',
      title: 'Delfín + Búho: ideas con rigor',
      desc: 'El Delfín genera impulso creativo y contagia energía; el Búho aporta estructura y validación de datos. Juntos crean propuestas difíciles de rebatir — si aprenden a respetar el ritmo del otro.',
      tip: 'Delfín: dale tiempo al Búho para procesar antes de pedir una decisión. Búho: valida en voz alta — el Delfín necesita señales de que va bien encaminado.'
    },
    'delfin-lobo': {
      type: 'energia',
      icon: '🔥',
      badge: 'Alta energía',
      title: 'Delfín + Lobo: chispa y visión',
      desc: 'El Lobo estructura la visión y toma decisiones con firmeza. El Delfín aporta la chispa relacional y la adaptabilidad que el Lobo necesita para conectar con el equipo.',
      tip: 'Lobo: deja espacio al Delfín para improvisar — su aparente desorden esconde conexiones valiosas. Delfín: llega con algo estructurado para ganarte la confianza del Lobo desde el primer minuto.'
    },
    'delfin-mariposa': {
      type: 'sinergia',
      icon: '🤝',
      badge: 'Sinergia natural',
      title: 'Delfín + Mariposa: conexión fluida y cálida',
      desc: 'Ambos priorizan la relación y la energía humana. La comunicación es fácil, cálida y generosa — el riesgo es que nadie ponga los límites ni empuje hacia una decisión concreta.',
      tip: 'Antes de la conversación, define un objetivo claro. Sin él, la dinámica puede ser muy agradable pero sin resultado tangible.'
    },

    /* ─── BÚHO ─── */
    'buho-delfin': {
      type: 'equilibrio',
      icon: '⚖️',
      badge: 'Equilibrio potente',
      title: 'Búho + Delfín: rigor que cobra vida',
      desc: 'El Búho valida y estructura; el Delfín humaniza y energiza. La combinación crea propuestas técnicamente sólidas y emocionalmente persuasivas.',
      tip: 'Búho: comparte tus análisis antes de que el Delfín llegue — así arrancáis del mismo punto sin perder tiempo en contexto. Delfín: deja que el Búho concluya su argumento antes de construir encima.'
    },
    'buho-buho': {
      type: 'tension',
      icon: '🔬',
      badge: 'Análisis profundo',
      title: 'Dos Búhos: precisión máxima, decisión lenta',
      desc: 'La conversación es meticulosa y rigurosa — pero puede entrar en bucle de análisis y nunca llegar a una conclusión accionable. Excelente para auditorías; menos eficaz para brainstorming.',
      tip: 'Pon un "deadline de decisión" al inicio. Dos Búhos necesitan un límite externo para salir del modo análisis.'
    },
    'buho-lobo': {
      type: 'equilibrio',
      icon: '⚖️',
      badge: 'Sólido y ejecutivo',
      title: 'Búho + Lobo: datos que se convierten en acción',
      desc: 'El Búho aporta la inteligencia analítica; el Lobo convierte esa inteligencia en decisiones y movimiento. Juntos son imparables — si el Lobo no atropella el proceso del Búho.',
      tip: 'Lobo: pide al Búho su síntesis antes de empujar hacia la decisión. Búho: cuando tengas suficientes datos, di "estoy listo para recomendar" — o el Lobo decidirá sin ti.'
    },
    'buho-mariposa': {
      type: 'equilibrio',
      icon: '⚖️',
      badge: 'Equilibrio fino',
      title: 'Búho + Mariposa: precisión humanizada',
      desc: 'El Búho aporta datos y solidez técnica. La Mariposa los traduce en lenguaje emocional y genera adhesión. Ideal para presentar resultados o negociaciones donde la lógica y la relación deben coexistir.',
      tip: 'Búho: confía en que la Mariposa puede "traducir" tu análisis sin perder rigor. Mariposa: asegúrate de entender los datos antes de comunicarlos — tu credibilidad depende de ello.'
    },

    /* ─── LOBO ─── */
    'lobo-delfin': {
      type: 'energia',
      icon: '🔥',
      badge: 'Alta energía',
      title: 'Lobo + Delfín: liderazgo con chispa',
      desc: 'El Lobo ordena y decide; el Delfín aporta entusiasmo y adaptabilidad. Una combinación muy efectiva para proyectos que necesitan dirección clara y ejecución ágil.',
      tip: 'Lobo: celebra las ideas del Delfín antes de filtrarlas — o lo perderás en los primeros cinco minutos. Delfín: traduce tus ideas en impacto concreto para conectar con el Lobo.'
    },
    'lobo-buho': {
      type: 'equilibrio',
      icon: '⚖️',
      badge: 'Sólido y ejecutivo',
      title: 'Lobo + Búho: decisión informada',
      desc: 'El Lobo empuja hacia el resultado; el Búho evita que se tomen decisiones sin el rigor necesario. La tensión entre velocidad y precisión puede ser su mayor fortaleza.',
      tip: 'Lobo: resiste el impulso de cerrar antes de que el Búho haya terminado. Ese "minuto extra" suele evitar errores costosos.'
    },
    'lobo-lobo': {
      type: 'tension',
      icon: '⚡',
      badge: 'Tensión de poder',
      title: 'Dos Lobos: poder y fricción',
      desc: 'Ambos quieren liderar y estructurar. Si van en la misma dirección, son imparables. Si no, la reunión puede convertirse en un pulso de autoridad sin resolución.',
      tip: 'Define roles y áreas de decisión antes de empezar. ¿Quién decide qué? Sin ese acuerdo previo, dos Lobos suelen chocar.'
    },
    'lobo-mariposa': {
      type: 'sinergia',
      icon: '🤝',
      badge: 'Sinergia ejecutiva',
      title: 'Lobo + Mariposa: dirección con corazón',
      desc: 'La Mariposa abre puertas emocionales y crea el contexto de confianza. El Lobo las convierte en acción concreta y decisiones claras. Excelente para negociaciones o presentaciones de impacto.',
      tip: 'Lobo: deja que la Mariposa caliente el espacio antes de entrar con la propuesta — la resistencia baja considerablemente. Mariposa: cuando el Lobo cierre, respáldale sin añadir más contexto.'
    },

    /* ─── MARIPOSA ─── */
    'mariposa-delfin': {
      type: 'sinergia',
      icon: '🤝',
      badge: 'Sinergia natural',
      title: 'Mariposa + Delfín: calidez y energía',
      desc: 'Una combinación muy fluida y humana. Crean espacios de conversación abierta y generosa. El riesgo: sin estructura, la energía no se traduce en resultados.',
      tip: 'Acuerda un orden del día claro. Con agenda, esta dupla es extraordinariamente efectiva. Sin ella, es una conversación muy agradable y poco productiva.'
    },
    'mariposa-buho': {
      type: 'equilibrio',
      icon: '⚖️',
      badge: 'Equilibrio fino',
      title: 'Mariposa + Búho: emoción con evidencia',
      desc: 'La Mariposa crea la conexión emocional; el Búho aporta los argumentos racionales. Juntos cubren todas las dimensiones de una comunicación persuasiva completa.',
      tip: 'Mariposa: pide al Búho que simplifique su argumento para tu audiencia. Búho: confía en que la conexión emocional de la Mariposa refuerza, no debilita, tus datos.'
    },
    'mariposa-lobo': {
      type: 'sinergia',
      icon: '🤝',
      badge: 'Sinergia ejecutiva',
      title: 'Mariposa + Lobo: conexión y acción',
      desc: 'La Mariposa prepara el terreno emocional; el Lobo ejecuta con decisión. Una de las combinaciones más efectivas para entornos de alta presión o negociaciones complejas.',
      tip: 'Mariposa: avisa al Lobo cuando hayas creado el contexto de confianza — es la señal para que entre con su propuesta. Lobo: respeta el proceso de la Mariposa, cada paso tiene un propósito.'
    },
    'mariposa-mariposa': {
      type: 'sinergia',
      icon: '💞',
      badge: 'Conexión profunda',
      title: 'Dos Mariposas: máxima empatía, mínima fricción',
      desc: 'La conexión es inmediata y profunda. El acuerdo llega con facilidad — pero puede ser un acuerdo sin nadie que lleve la contraria. El riesgo es la cámara de eco emocional.',
      tip: 'Designa a alguien externo (o a ti misma) para hacer de abogado del diablo. Dos Mariposas necesitan fricción externa para tomar decisiones robustas.'
    }
  };

  var animalLabels = {
    delfin: '🐬 Delfín', buho: '🦉 Búho', lobo: '🐺 Lobo', mariposa: '🦋 Mariposa'
  };
  var animalPillClass = {
    delfin: 'pill-delfin', buho: 'pill-buho', lobo: 'pill-lobo', mariposa: 'pill-mariposa'
  };
  var typeBadgeClass = {
    sinergia: 'badge-sinergia', tension: 'badge-tension',
    equilibrio: 'badge-equilibrio', energia: 'badge-energia'
  };
  var typeIconClass = {
    sinergia: 'type-sinergia', tension: 'type-tension',
    equilibrio: 'type-equilibrio', energia: 'type-energia'
  };

  var myProfile   = null;
  var theirProfile = null;

  var myBtns    = document.querySelectorAll('#myProfileBtns .compat-animal-btn');
  var theirBtns = document.querySelectorAll('#theirProfileBtns .compat-animal-btn');
  var emptyEl   = document.getElementById('compatEmpty');
  var cardEl    = document.getElementById('compatResultCard');

  function setActive(btnGroup, picked) {
    btnGroup.forEach(function(b) {
      b.classList.toggle('active', b.getAttribute('data-pick') === picked);
    });
  }

  function renderResult() {
    if (!myProfile || !theirProfile) {
      emptyEl.style.display = '';
      cardEl.classList.remove('visible');
      return;
    }
    var key = myProfile + '-' + theirProfile;
    var data = compat[key];
    if (!data) return;

    emptyEl.style.display = 'none';

    // Icon
    document.getElementById('compatResultIcon').className = 'compat-result-type ' + typeIconClass[data.type];
    document.getElementById('compatResultIcon').textContent = data.icon;

    // Combo pills
    document.getElementById('compatResultCombo').innerHTML =
      '<span class="compat-pill ' + animalPillClass[myProfile] + '">' + animalLabels[myProfile] + '</span>' +
      '<span class="compat-result-arrow">+</span>' +
      '<span class="compat-pill ' + animalPillClass[theirProfile] + '">' + animalLabels[theirProfile] + '</span>';

    // Badge
    document.getElementById('compatResultBadge').className = 'compat-result-badge ' + typeBadgeClass[data.type];
    document.getElementById('compatResultBadge').textContent = data.badge;

    // Content
    document.getElementById('compatResultTitle').textContent = data.title;
    document.getElementById('compatResultDesc').textContent  = data.desc;
    document.getElementById('compatResultTip').textContent   = '💡 ' + data.tip;

    // Show with animation re-trigger
    cardEl.classList.remove('visible');
    void cardEl.offsetWidth; // reflow
    cardEl.classList.add('visible');
  }

  myBtns.forEach(function(btn) {
    btn.addEventListener('click', function() {
      myProfile = btn.getAttribute('data-pick');
      setActive(myBtns, myProfile);
      renderResult();
    });
  });

  theirBtns.forEach(function(btn) {
    btn.addEventListener('click', function() {
      theirProfile = btn.getAttribute('data-pick');
      setActive(theirBtns, theirProfile);
      renderResult();
    });
  });

})();
