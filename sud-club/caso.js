// caso.js: las piezas vivas del caso de SUD CLUB, hechas en código
// (construcción del logo, cinco estados, iconografía, carteles, publicaciones y tres vídeos cortos).
// Necesita landing/sud-logo.js cargado antes (el logo dibujado, copia exacta del original).
(function () {
  // ---------- Utilidades ----------
  const S = SUD.STATES, T = S.map((s) => s.t);                       // estados: 18, 26, 32, 38, 44
  const C = { cal: "#F3EEE4", sombra: "#2E4A68", arcilla: "#B4643F", ocre: "#E0A93E", tomate: "#D8352A", brasa: "#1C0F0B" };
  const calm = matchMedia("(prefers-reduced-motion: reduce)").matches; // quien pide menos movimiento ve las piezas quietas
  const clamp = (v) => Math.max(0, Math.min(1, v));                  // limita entre 0 y 1
  const suave = (v) => 0.5 - 0.5 * Math.cos(clamp(v) * Math.PI);     // curva suave de 0 a 1
  const rgb = (h) => [1, 3, 5].map((n) => parseInt(h.slice(n, n + 2), 16));
  function colorAt(t, key) {                                          // color de fondo o tinta a cualquier temperatura
    let i = 0; while (i < 3 && t > T[i + 1]) i++;
    const k = clamp((t - T[i]) / (T[i + 1] - T[i]));
    const a = rgb(S[i][key]), b = rgb(S[i + 1][key]);
    return `rgb(${a.map((v, j) => Math.round(v + (b[j] - v) * k)).join(",")})`;
  }
  const $ = (id) => document.getElementById(id);

  // Animaciones: un solo reloj para todas, y solo se mueven las que están a la vista
  const visibles = new Set(), bucles = [];
  const ojo = new IntersectionObserver((es) => es.forEach((e) => (e.isIntersecting ? visibles.add(e.target) : visibles.delete(e.target))), { threshold: 0.05 });
  function bucle(el, fn, quieto) {                                    // fn(segundos) dibuja la pieza; "quieto" = segundo que se enseña sin animación
    bucles.push({ el, fn }); ojo.observe(el); fn(quieto);
  }
  if (!calm) requestAnimationFrame(function tic(now) {
    bucles.forEach((b) => visibles.has(b.el) && b.fn(now / 1000));
    requestAnimationFrame(tic);
  });

  // ---------- 1. Construcción del logo sobre la retícula de 5 franjas ----------
  (function () {
    const el = $("sudBuild"); if (!el) return;
    const reticula = [0, 20, 40, 60, 80, 100].map((y) => `<line x1="-2" x2="264" y1="${y}" y2="${y}"/>`).join("") +
      [1, 2, 3, 4, 5].map((k) => `<text class="n" x="-12" y="${(k - 1) * 20 + 13}">${k}</text>`).join(""); // líneas y números de módulo
    const svg = SUD.logo({ state: 0, align: "xMidYMid" }).replace(/<path /g, '<path pathLength="1" ') // para dibujar el trazo
      .replace(/(<svg[^>]*>)/, `$1<g class="ret">${reticula}</g>`);  // la retícula, dentro del mismo dibujo
    el.innerHTML = `<div class="b-logo">${svg}</div><div class="b-cap"><span>Retícula de 5 franjas · la de la persiana</span><span>Construcción</span></div>`;
    bucle(el, (t) => {
      const p = t % 8, fuera = 1 - clamp((p - 6.8) / 0.8);             // ciclo de 8 s; al final todo se desvanece
      el.style.setProperty("--g", (clamp(p / 0.6) * fuera).toFixed(3));                 // aparece la retícula
      el.style.setProperty("--d", (suave((p - 0.6) / 2.6) * fuera).toFixed(3));        // las letras se dibujan
      el.style.setProperty("--pers", (clamp((p - 3.2) / 0.4) * fuera).toFixed(3));     // baja la persiana
      el.style.setProperty("--club", (clamp((p - 3.6) / 0.4) * fuera).toFixed(3));     // aparece CLUB
    }, 5);
  })();

  // ---------- 2. Los cinco estados ----------
  (function () {
    const el = $("sudStates"); if (!el) return;
    const pares = ["Cal + sombra", "Cal + arcilla", "Ocre + brasa", "Ocre + tomate", "Tomate + brasa"];
    const pieza = (i) => {                                            // un estado: logo + su nombre
      const s = S[i];
      return `<div class="st" style="color:${s.ink}">
        <div class="band-logo">${i === 3 ? `<div class="band-ghost">${SUD.logo({ state: i })}</div>` : ""}${SUD.logo({ state: i })}</div>
        <div class="band-txt"><b>${s.t}° ${s.name}</b><span>${pares[i]}</span></div></div>`;
    };
    // Cinco bloques independientes, dos por fila: cal (Sombra, Tibio), ocre (Bochorno, Calima) y tomate (Fuego, a todo el ancho)
    el.innerHTML = S.map((s, i) => `
      <div class="stb${i === 4 ? " wide" : ""}" style="background:${s.bg};transition-delay:${i * 0.1}s">${pieza(i)}</div>`).join("");
    new IntersectionObserver((es, o) => es.forEach((e) => { if (e.isIntersecting) { el.classList.add("on"); o.disconnect(); } }), { threshold: 0.2 }).observe(el); // entran como lamas al verse
    const ghost = el.querySelector(".band-ghost");
    bucle(el, (t) => {                                                 // la calima tiembla, 12 veces por segundo
      const f = Math.floor(t * 12);
      ghost.style.transform = `translate(${(1.4 + Math.sin(f * 7.3) * 0.6).toFixed(2)}%, ${(Math.cos(f * 3.1) * 0.8).toFixed(2)}%)`;
    }, 0);
  })();

  // ---------- 3. Iconografía (27 iconos que se dibujan en cascada) ----------
  (function () {
    const el = $("sudIcons"); if (!el) return;
    const ICONOS = {
      "El club": ["M4 14 H36 M8 14 V34 M32 14 V34 M4 20 H36", "M12 4 V36 M12 22 H30 M30 22 V36 M12 12 H22", "M6 8 H34 V34 H6 Z M6 16 H34 M14 4 V12 M26 4 V12|M12 22 h6 v6 h-6 Z", "M20 6 A14 14 0 1 1 19.99 6 M20 11 V20 H28", "M20 36 L9.6 24 A12 12 0 1 1 30.4 24 Z M20 12 A4 4 0 1 1 19.99 12", "M4 12 H36 V17 A3 3 0 0 0 36 23 V28 H4 V23 A3 3 0 0 0 4 17 Z M26 14 V16 M26 19 V21 M26 24 V26", "M14 9 A5 5 0 1 1 13.99 9 M26 9 A5 5 0 1 1 25.99 9 M5 34 A9 9 0 0 1 23 34 M17 34 A9 9 0 0 1 35 34"],
      "La despensa": ["M17 4 H23 V12 L28 18 V36 H12 V18 L17 12 Z M12 24 H28", "M4 10 H36 V30 H4 Z M9 20 C13 16 21 16 25 20 C21 24 13 24 9 20 Z M25 20 L30 16 V24 Z", "M10 8 H30 L28 36 H12 Z M11 18 H29|M23 23 a3 3 0 1 1 -0.01 0 Z", "M6 30 V22 A14 10 0 0 1 34 22 V30 Z M14 20 L18 15 M22 20 L26 15", "M20 10 A12 12 0 1 1 19.99 10 M20 10 V4 M14 10 H26", "M24 9 A11 11 0 1 1 23.99 9 M24 15 A5 5 0 1 1 23.99 15 M6 6 V34 M6 6 A4 6 0 0 1 6 18", "M10 6 H30 V34 H10 Z M10 12 H30 M10 28 H30 M16 18 H24 M16 22 H22"],
      "El calor": ["|M20 7 A13 13 0 0 1 29.38 11 H10.62 A13 13 0 0 1 20 7 Z M8.47 14 H31.53 A13 13 0 0 1 32.85 18 H7.15 A13 13 0 0 1 8.47 14 Z M7.04 21 H32.96 A13 13 0 0 1 32 25 H8 A13 13 0 0 1 7.04 21 Z M9.75 28 H30.25 A13 13 0 0 1 20 33 A13 13 0 0 1 9.75 28 Z", "M6 15 H34 M6 21 H34 M6 27 H34 M6 33 H34|M6 4 H34 V10 H6 Z", "M15 24 V9 A5 5 0 0 1 25 9 V24 A8 8 0 1 1 15 24 Z M20 30 V14", "M20 34 L5.2 19 M20 34 L11.2 12 M20 34 L20 10 M20 34 L28.8 12 M20 34 L34.8 19 M5.2 19 A21 21 0 0 1 34.8 19", "|M20 4 C24 12 30 18 30 25 A10 10 0 0 1 10 25 C10 18 16 12 20 4 Z", "M26 7 A14 14 0 1 0 33 27 A11 11 0 0 1 26 7 Z"],
      "Digital": ["M8 4 H32 V36 H8 Z M8 12 H32 M13 20 H27 M13 26 H23", "M4 9 H36 V31 H4 Z M4 9 L20 22 L36 9", "M17 6 A11 11 0 1 1 16.99 6 M25 25 L35 35", "M8 14 H32 L30 36 H10 Z M14 14 V10 A6 6 0 0 1 26 10 V14", "M20 6 A7 7 0 1 1 19.99 6 M6 36 A14 14 0 0 1 34 36", "M6 20 H34 M24 10 L34 20 L24 30", "M8 8 L32 32 M32 8 L8 32"],
    };                                                                // cada icono: "trazo|relleno" en un lienzo de 40 × 40
    let k = 0;
    const icono = (def) => {                                         // dibuja un icono: trazo + relleno
      const [s, f] = def.split("|");
      return `<svg viewBox="0 0 40 40" style="--i:${k++}">${s ? `<path class="s" pathLength="1" d="${s}"/>` : ""}${f ? `<path class="f" d="${f}"/>` : ""}</svg>`;
    };
    el.innerHTML = Object.entries(ICONOS).map(([fam, lista]) =>
      `<div class="fam"><span>${fam}</span><div>${lista.map(icono).join("")}</div></div>`).join("");
  })();

  // ---------- 4. Carteles (uno por pieza) ----------
  const CARTELES = [
    { i: 3, foto: "foto-02-siesta.jpg", frase: "A temperature,<br>not a place." },
    { i: 2, foto: "cartel-terraza.jpg", pos: "50% 42%", frase: "Nobody goes out<br>before seven." },       // la terraza: encuadre en las caras
    { i: 4, foto: "cartel-pan.jpg", pos: "50% 45%", frase: "Culture served<br>at high temperature." },      // el pan con aceite, centrado
  ];
  CARTELES.forEach((c, n) => {
    const el = $("cartel" + (n + 1)); if (!el) return;
    const s = S[c.i];
    el.innerHTML = `<div class="poster" style="background:${s.bg};color:${s.ink}">
      <div class="p-head">${c.frase}</div>
      <div class="p-photo"><img src="imgs/${c.foto}" alt="" loading="lazy" decoding="async"${c.pos ? ` style="object-position:${c.pos}"` : ""}></div>
      <div class="p-logo">${SUD.logo({ state: c.i })}</div>
      <div class="p-foot"><span>Marseille · 18.06.2027</span><span>${s.t} °C · ${s.name}</span></div></div>`;
  });

  // ---------- 5. Redes: el perfil de Instagram (12 publicaciones) y tres stories ----------
  (function () {
    const feed = $("igFeed"); if (!feed) return;
    const PERS = `<svg viewBox="0 0 40 40"><path d="M6 4 H34 V10 H6 Z" fill="currentColor"/><path d="M6 15 H34 M6 21 H34 M6 27 H34 M6 33 H34" stroke="currentColor" stroke-width="3"/></svg>`; // la persiana sola
    $("igAv").innerHTML = PERS;                                         // avatar del perfil
    const FOTOS = { "Las tres": "foto-03-las-tres.jpg", "Siesta": "foto-02-siesta.jpg", "Sobremesa": "foto-01-sobremesa.jpg", "Aceite": "foto-04-aceite.jpg" };
    const P = {                                                         // los cuatro tipos de publicación
      foto: (s, cap) => `<div class="post" style="background:${s.bg} url('imgs/${FOTOS[cap]}') center/cover"><span class="ig-f" style="color:${C.cal}"><span>${cap}</span><span>${s.t}°</span></span></div>`, // foto de la serie
      frase: (s, txt) => `<div class="post" style="background:${s.bg};color:${s.ink}"><span class="po-k">${s.t}° ${s.name}</span><div class="po-txt">${txt}</div></div>`, // frase grande
      dato: (s, num, txt) => `<div class="post" style="background:${s.bg};color:${s.ink}"><span class="po-k">Data</span><div class="po-num">${num}</div><div class="po-txt sm">${txt}</div></div>`, // cifra
      logo: (s) => `<div class="post" style="background:${s.bg};color:${s.ink}"><div class="po-logo">${SUD.logo({ state: S.indexOf(s), align: "xMidYMid" })}</div></div>`, // logo en su estado
    };
    // Cada fila es una semana y un estado: arriba la más reciente (Fuego), abajo la primera (Tibio)
    feed.innerHTML = [
      P.logo(S[4]), P.frase(S[4], "Culture served at high temperature."), P.foto(S[4], "Las tres"),
      P.dato(S[3], "21:30", "Sevilla goes out at half past nine."), P.foto(S[3], "Siesta"), P.frase(S[3], "Nº 38 °C. Out in June."),
      P.frase(S[2], "Nobody goes out before seven."), P.dato(S[2], "15:00", "The hottest hour. Shutters down."), P.foto(S[2], "Sobremesa"),
      P.foto(S[1], "Aceite"), P.frase(S[1], "A temperature, not a place."), P.logo(S[1]),
    ].join("");
    // Stories: encuesta de temperatura, cuenta atrás y aviso de la revista del domingo
    const st = (n, html) => { const el = $("story" + n); if (el) el.innerHTML = html; };
    st(1, `<div class="story" style="background:${C.cal};color:${C.sombra}"><span class="po-k">Sunday poll</span>
      <div class="sy-t" style="top:22cqi;font-size:15cqi">How hot is it where you are?</div>
      <div class="sy-box" style="top:80cqi;background:#fff"><div style="height:2.4cqi;border-radius:2cqi;background:linear-gradient(90deg,${C.sombra},${C.ocre},${C.tomate})"></div><div class="sy-row"><span>18°</span><span>44°</span></div></div>
      <span class="sy-f"><span>Slider sticker</span><span>sud.club</span></span></div>`);
    st(2, `<div class="story" style="background:${C.tomate};color:${C.brasa}"><span class="po-k">SUD Mesa · Marseille</span>
      <div class="sy-t" style="top:24cqi;font-size:30cqi">18.06</div>
      <div class="sy-t" style="top:60cqi;font-size:11cqi">Launch dinner. Doors at nine.</div>
      <div class="sy-box" style="top:102cqi;background:${C.brasa};color:${C.cal};text-align:center">Countdown · 00 : 21 : 00</div>
      <span class="sy-f"><span>Countdown sticker</span><span>44°</span></span></div>`);
    st(3, `<div class="story" style="background:${C.sombra};color:${C.cal}"><span class="po-k">Sunday · 15:00</span>
      <div style="position:absolute;left:7cqi;top:22cqi;width:22cqi">${PERS}</div>
      <div class="sy-t" style="top:50cqi;font-size:16cqi">La Sobremesa is out.</div>
      <div class="sy-it" style="top:98cqi">Best read lying down, shutters half closed.</div>
      <span class="sy-f"><span>Link sticker</span><span>18°</span></span></div>`);
  })();

  // ---------- 6. Vídeos cortos (9:16), en bucle ----------
  // 6a · El termómetro: el logo sube de 18° a 44° y vuelve
  (function () {
    const el = $("reel1"); if (!el) return;
    el.innerHTML = `<div class="reel"><div class="r-num"></div><div class="r-name"></div><div class="r-logo"></div><div class="r-foot">A temperature, not a place.</div></div>`;
    const box = el.firstChild, num = box.querySelector(".r-num"), name = box.querySelector(".r-name"), slot = box.querySelector(".r-logo");
    let ultima = -1;
    bucle(el, (t) => {
      const temp = 18 + 26 * (0.5 - 0.5 * Math.cos(((t % 7) / 7) * 2 * Math.PI)); // ida y vuelta en 7 s
      if (Math.abs(temp - ultima) < 0.15) return; ultima = temp;     // si apenas cambia, no se redibuja
      box.style.background = colorAt(temp, "bg"); box.style.color = colorAt(temp, "ink");
      const svg = SUD.logoAt(temp, { align: "xMidYMax" });
      const h = +svg.match(/viewBox="([^"]+)"/)[1].split(" ")[3];   // el alto crece con el estirón
      slot.style.height = (h / 108) * 26 + "cqi"; slot.innerHTML = svg; // las letras ocupan casi todo el ancho en Tibio
      num.textContent = `${Math.round(temp)}°`;
      name.textContent = S.reduce((b, s) => (Math.abs(s.t - temp) < Math.abs(b.t - temp) ? s : b)).name;
    }, 3.5);
  })();
  // 6b · Tipografía cinética: cada palabra se ensancha con el calor, en cascada (ancho de 50 a 130)
  (function () {
    const el = $("kinetic"); if (!el) return;
    el.innerHTML = `<div class="reel kin">${["Nobody", "goes", "out", "before", "seven."].map((w, i) => `<span style="--i:${i}">${w}</span>`).join("")}</div>`;
  })();

  // ---------- 8. La noche del evento: cada hora, un estado ----------
  (function () {
    const el = $("noche"); if (!el) return;
    const HORAS = [
      ["21:00", "Llegada. Vermut de pie en el patio."], ["22:00", "Nos sentamos. Entrantes fríos y aceite."],
      ["23:00", "Platos calientes. La luz baja a ocre."], ["00:00", "Sobremesa. Llega el fuego."], ["01:00", "Fiesta. Nadie mira la hora."],
    ];
    el.innerHTML = HORAS.map(([h, txt], i) => `<div class="hora" style="background:${S[i].bg};color:${S[i].ink}">
      <div><b>${h}</b><span>${S[i].t}° ${S[i].name}</span></div><p>${txt}</p></div>`).join(""); // una columna por hora
  })();

  // ---------- 8b. Piezas impresas del evento y la mesa larga ----------
  (function () {
    const menu = $("evMenu"); if (!menu) return;
    // Menú: cada plato dice a qué temperatura se sirve
    const PLATOS = [
      ["Vermut de Reus, con hielo", "6 °C"], ["Gazpacho de tomate y ocre", "8 °C"], ["Anchoas de L'Escala, pan y aceite", "18 °C"],
      ["Sardinas a la brasa", "62 °C"], ["Arroz del senyoret", "70 °C"], ["Higos con miel y cal", "22 °C"],
    ];
    menu.innerHTML = `
      <div style="position:absolute;left:8cqi;right:8cqi;top:8cqi;color:${C.arcilla}">${SUD.logo({ variant: "sub", label: "MESA", state: 1 })}</div>
      <div class="ev-k" style="left:8cqi;top:46cqi;color:${C.arcilla}">Marseille · 18.06.2027</div>
      <div class="ev-t" style="left:8cqi;right:8cqi;top:54cqi;font-size:13cqi;color:${C.arcilla}">Served at</div>
      <div style="position:absolute;left:8cqi;right:8cqi;top:72cqi">${PLATOS.map(([d, t]) => `
        <div style="display:flex;justify-content:space-between;align-items:baseline;gap:4cqi;padding:3.4cqi 0;border-top:.4cqi solid ${C.arcilla}">
          <span class="ev-serif" style="font-size:5.6cqi;line-height:1.15;color:${C.brasa}">${d}</span>
          <span class="ev-num" style="font-size:4.6cqi;color:${C.arcilla}">${t}</span></div>`).join("")}</div>
      <div class="ev-k" style="left:8cqi;right:8cqi;bottom:6cqi;color:${C.arcilla};display:flex;justify-content:space-between"><span>Sobremesa until 1:00</span><span>26° Tibio</span></div>`;
    // Entrada (Fuego): la fecha manda; el resguardo lleva la persiana del logo y el asiento
    const pers = (w) => `<svg viewBox="-1 -1 28 42" style="width:${w}cqi;display:block" fill="${C.brasa}">${SUD.persiana(0, 1)}</svg>`; // la persiana exacta del logo
    $("evTicket").innerHTML = `
      <div style="position:absolute;left:5cqi;top:5cqi;width:12cqi;color:${C.brasa}">${SUD.logo({ variant: "sub", label: "MESA", state: 4 })}</div>
      <div class="ev-k" style="right:31cqi;top:5.5cqi;font-size:2.6cqi;color:${C.brasa}">Admit one · Nº 01</div>
      <div class="ev-t" style="left:4.6cqi;top:18cqi;font-size:13cqi;font-variation-settings:'wdth' 70,'wght' 800;color:${C.brasa}">18.06.27</div>
      <div class="ev-serif" style="position:absolute;left:5cqi;top:31.5cqi;font-size:3.6cqi;font-style:italic;color:${C.brasa}">Launch dinner in a courtyard, Marseille.</div>
      <div class="ev-datos" style="left:5cqi;right:31cqi;bottom:4.5cqi;border-color:${C.brasa};color:${C.brasa}">
        <div><span>Doors</span><b>21:00</b></div><div><span>Until</span><b>01:00</b></div><div><span>Served at</span><b>44°</b></div></div>
      <div style="position:absolute;right:26cqi;top:0;bottom:0;border-left:.35cqi dashed ${C.brasa}"></div>
      <div style="position:absolute;right:0;top:0;bottom:0;width:26cqi;display:flex;flex-direction:column;align-items:center;justify-content:space-between;padding:5cqi 0 4.5cqi;box-sizing:border-box;color:${C.brasa}">
        ${pers(8)}
        <div style="text-align:center"><div class="ev-num" style="font-size:2.6cqi;letter-spacing:.08em;text-transform:uppercase">Seat</div><div class="ev-t" style="position:static;font-size:9cqi">038</div></div>
        <div class="ev-num" style="font-size:2.4cqi;letter-spacing:.08em;text-transform:uppercase">Tear here ↑</div>
      </div>`;
    // Tarjeta de sitio (Bochorno): el nombre y, debajo, en qué temperatura de la mesa te sientas
    const pos = (t) => ((t - 18) / 26 * 100).toFixed(1);               // posición en la escala de 18° a 44°
    $("evPlace").innerHTML = `
      <div style="position:absolute;left:7cqi;top:7cqi;display:flex;align-items:center;gap:2cqi">${pers(3.2)}<span class="ev-num" style="font-size:2.8cqi;letter-spacing:.08em;text-transform:uppercase;color:${C.brasa}">SUD Mesa</span></div>
      <div class="ev-k" style="right:7cqi;top:7.4cqi;font-size:2.8cqi;color:${C.brasa}">Seat 038</div>
      <div class="ev-t" style="left:6.4cqi;top:17cqi;font-size:21cqi;color:${C.brasa}">Lucía</div>
      <div class="ev-serif" style="position:absolute;left:7cqi;right:7cqi;top:39cqi;font-size:4.4cqi;font-style:italic;line-height:1.25;color:${C.brasa}">You're sitting in the warm part of the table.</div>
      <div style="position:absolute;left:7cqi;right:7cqi;bottom:7cqi;height:9cqi;color:${C.brasa}">
        <div style="position:absolute;left:0;right:0;top:2cqi;border-top:.35cqi solid currentColor"></div>
        ${S.map((st) => `<div style="position:absolute;left:${pos(st.t)}%;top:0.6cqi;height:3cqi;border-left:.35cqi solid currentColor"></div>
          <div class="ev-num" style="position:absolute;left:${pos(st.t)}%;top:5cqi;transform:translateX(-50%);font-size:2.4cqi">${st.t}°</div>`).join("")}
        <div style="position:absolute;left:${pos(32)}%;top:2cqi;width:3.6cqi;height:3.6cqi;border-radius:50%;background:${C.brasa};transform:translate(-50%,-50%);box-shadow:0 0 0 .8cqi ${C.ocre}"></div>
      </div>`;
    // Señalética (Fuego): flecha del sistema de iconos, titular enorme y la persiana bajada al pie
    $("evSign").innerHTML = `
      <div style="position:absolute;left:7cqi;top:7cqi;width:24cqi;color:${C.brasa}">${SUD.logo({ state: 4 })}</div>
      <div class="ev-k" style="right:7cqi;top:8cqi;font-size:3cqi;color:${C.brasa}">44° Fuego</div>
      <svg viewBox="4 8 32 24" style="position:absolute;left:6cqi;top:28cqi;width:40cqi" fill="none" stroke="${C.brasa}" stroke-width="4.4" stroke-linecap="butt"><path d="M6 20 H33 M23 10 L33 20 L23 30"/></svg>
      <div class="ev-t" style="left:6cqi;right:6cqi;top:62cqi;font-size:27cqi;font-variation-settings:'wdth' 70,'wght' 800;line-height:.86;color:${C.brasa}">Mesa<br>larga</div>
      <div class="ev-k" style="left:7cqi;right:7cqi;top:113cqi;font-size:3cqi;display:flex;justify-content:space-between;color:${C.brasa}"><span>Patio · 30 m</span><span>21:00 — 01:00</span></div>
      <div style="position:absolute;left:0;right:0;bottom:0;height:26cqi">${[0, 1, 2, 3].map((j) => `<div style="position:absolute;left:0;right:0;top:${j * 6.6}cqi;height:${3 + j * 0.9}cqi;background:${C.brasa}"></div>`).join("")}</div>`;
    // La mesa larga, vista desde arriba: platos, sillas y un camino de mesa que se calienta de la sombra al fuego
    const W = 1000, H = 300, n = 44, x0 = 60, x1 = 940;
    const TONOS = [C.sombra, C.arcilla, C.ocre, C.tomate, C.brasa];    // del frío al fuego
    const tono = (q) => { const f = q * 4, i = Math.min(3, Math.floor(f)), k = f - i, a = rgb(TONOS[i]), b = rgb(TONOS[i + 1]); return `rgb(${a.map((v, j) => Math.round(v + (b[j] - v) * k)).join(",")})`; };
    let camino = "", mesa = "";
    for (let j = 0; j < n; j++) {                                      // lamas: más finas y frías a la izquierda, gruesas y calientes a la derecha
      const q = j / (n - 1), paso = (x1 - x0) / n, w = paso * (0.22 + 0.6 * q);
      camino += `<rect x="${(x0 + j * paso + (paso - w) / 2).toFixed(1)}" y="133" width="${w.toFixed(1)}" height="34" fill="${tono(q)}"/>`;
    }
    const SITIOS = 26, sep = (x1 - x0) / SITIOS, marca = 12;           // sitios por lado; el 038 de Lucía es el 12.º de arriba
    for (let j = 0; j < SITIOS; j++) {
      const x = x0 + sep * (j + 0.5), mio = j === marca;
      mesa += `<rect x="${x - 9}" y="${mio ? 68 : 72}" width="18" height="12" rx="3" fill="${mio ? C.brasa : "#CDBFA8"}"/>` +   // silla de arriba
        `<rect x="${x - 9}" y="216" width="18" height="12" rx="3" fill="#CDBFA8"/>` +                                              // silla de abajo
        `<circle cx="${x}" cy="114" r="8" fill="#FBF8F2" stroke="#D3C6B0" stroke-width="1.2"/><circle cx="${x}" cy="186" r="8" fill="#FBF8F2" stroke="#D3C6B0" stroke-width="1.2"/>`; // platos
    }
    const xm = x0 + sep * (marca + 0.5);
    const mono = (x, y, txt, anchor = "start", op = 1) => `<text x="${x}" y="${y}" text-anchor="${anchor}" opacity="${op}" style="font-family:Recursive,monospace;font-variation-settings:'MONO' 1,'wght' 600;font-size:11px;letter-spacing:.08em" fill="${C.brasa}">${txt}</text>`;
    const tramos = S.map((st, i) => { const xa = x0 + (x1 - x0) * i / 5; return `<line x1="${xa}" x2="${xa}" y1="244" y2="254" stroke="${C.brasa}" stroke-width="1"/>` + mono(xa + 6, 262, `${st.t}° ${st.name.toUpperCase()}`); }).join("");
    $("evMesa").innerHTML = `<svg viewBox="0 0 ${W} ${H}" aria-hidden="true"><rect width="${W}" height="${H}" fill="${C.cal}"/>
      ${mono(x0, 34, "SUD MESA · LA MESA LARGA")}${mono(x1, 34, "30 M · 52 SITIOS · PATIO, MARSELLA", "end", .6)}
      <rect x="${x0 - 14}" y="96" width="${x1 - x0 + 28}" height="108" rx="4" fill="#E9E0D0"/>${camino}${mesa}
      <line x1="${xm}" x2="${xm}" y1="48" y2="64" stroke="${C.brasa}" stroke-width="1"/>${mono(xm + 8, 58, "038 · LUCÍA")}
      <line x1="${x0}" x2="${x1}" y1="244" y2="244" stroke="${C.brasa}" stroke-width="1" opacity=".35"/>${tramos}</svg>`;
  })();

  // ---------- 7. Carrusel "Who goes out when?" (5 diapositivas) ----------
  (function () {
    const el = $("carrusel"); if (!el) return;
    const CIUDADES = [["Sevilla", 36, "21:30"], ["Napoli", 30, "20:30"], ["Marseille", 29, "20:00"]];
    const slide = (bg, dentro) => `<div class="post slide" style="background:${bg};color:${C.brasa}">${dentro}</div>`;
    el.innerHTML = [
      slide(C.ocre, `<span class="po-k">SUD ° · Data · 1/5</span><div class="cs-title">Who goes out when?</div><span class="cs-foot"><span>Swipe →</span><span>38 °C</span></span>`),
      ...CIUDADES.map(([c, t, h], k) => slide(C.ocre, `<span class="po-k">${k + 2}/5</span><div class="cs-city">${c}</div>
        <i class="cs-lama" style="right:${100 - (t - 20) * 5.5}cqi;height:${(t - 26) * 3.2}cqi"></i>
        <div class="cs-hour">${h}</div><span class="cs-foot"><span>${t} °C in August</span><span>→</span></span>`)), // la lama engorda con la temperatura
      slide(C.tomate, `<span class="po-k">5/5</span><div class="cs-end">Heat doesn't empty the south. It moves it to the night.</div><span class="cs-foot"><span>SUD ° Nº 38</span><span>Link in bio</span></span>`),
    ].join("");
  })();
})();
