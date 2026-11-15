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

  // ---------- 5. Publicaciones de redes (piezas sueltas, 4:5) ----------
  const POSTS = [
    { i: 4, tipo: "logo" }, { i: 4, tipo: "frase", txt: "Culture served at high temperature." },
    { i: 3, tipo: "dato", num: "21:30", txt: "Sevilla goes out at half past nine." },
    { i: 2, tipo: "frase", txt: "Nobody goes out before seven." }, { i: 2, tipo: "dato", num: "15:00", txt: "The hottest hour. Shutters down." },
    { i: 1, tipo: "frase", txt: "A temperature, not a place." },
  ];
  POSTS.forEach((p, n) => {
    const el = $("post" + (n + 1)); if (!el) return;
    const s = S[p.i];
    const dentro = p.tipo === "logo" ? `<div class="po-logo">${SUD.logo({ state: p.i, align: "xMidYMid" })}</div>`
      : p.tipo === "dato" ? `<div class="po-num">${p.num}</div><div class="po-txt sm">${p.txt}</div>`
      : `<div class="po-txt">${p.txt}</div>`;
    el.innerHTML = `<div class="post" style="background:${s.bg};color:${s.ink}"><span class="po-k">${p.tipo === "dato" ? "Data" : `${s.t}° ${s.name}`}</span>${dentro}</div>`;
  });

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
