// SUD CLUB · logotipo dibujado a medida — COPIA EXACTA de 02-identidad/identidad-base.html
// Todas las piezas nuevas deben usar este archivo para que el logo no se deforme.
// Uso: <script src="../shared/sud-logo.js"></script> y luego SUD.logo({ state: 2, variant: "full" })
(function () {
  // ---------- Escala térmica ----------
  const STATES = [                                                   // temperatura, nombre, fondo y tinta de cada estado
    { t: 18, name: "Sombra",   bg: "#F3EEE4", ink: "#2E4A68" },
    { t: 26, name: "Tibio",    bg: "#F3EEE4", ink: "#B4643F" },
    { t: 32, name: "Bochorno", bg: "#E0A93E", ink: "#1C0F0B" },
    { t: 38, name: "Calima",   bg: "#E0A93E", ink: "#D8352A" },
    { t: 44, name: "Fuego",    bg: "#D8352A", ink: "#1C0F0B" },
  ];
  const CUSTOM = [                                                   // ancho de letra (k), grosor (s) y espacio (gap) por estado
    { k: 1, s: 18, gap: 14 }, { k: 1.4, s: 17, gap: 20 }, { k: 0.8, s: 19, gap: 12 },
    { k: 1, s: 20, gap: 14 }, { k: 0.9, s: 21, gap: 14 },
  ];
  const STRETCH = [1, 1, 1, 1, 1.4];                                 // estirón vertical (solo Fuego)
  const BASEW = { S: 60, U: 64, D: 66 };                             // ancho base de cada letra
  const MONO = "font-family:Recursive,monospace;font-variation-settings:'MONO' 1,'wght' 700"; // estilo de CLUB y etiquetas

  // ---------- Trazo central de cada letra (alto 100) ----------
  function glyph(ch, x, W, s, H = 100) {
    const h = s / 2;                                                 // medio trazo
    if (ch === "U") {                                                // U: baja, curva y sube
      const Ry = Math.min(W / 2, H * 0.45), rxc = (W - s) / 2, ryc = Ry - h;
      return `M${x + h} 0 V${H - Ry} A${rxc} ${ryc} 0 0 0 ${x + W - h} ${H - Ry} V0`;
    }
    if (ch === "D") {                                                // D: asta + panza
      const rxc = Math.min((W - s) * 0.62, (H - s) / 2), xa = x + W - h - rxc;
      return `M${x + h} 0 V${H} M${x + h} ${h} H${xa} A${rxc} ${(H - s) / 2} 0 0 1 ${xa} ${H - h} H${x + h}`;
    }
    const cx = x + W / 2, rx = (W - s) / 2, ry = (H / 2 - h) / 2, y1 = h + ry, y2 = H - h - ry; // S: dos medias elipses
    return `M${cx + rx} ${y1} A${rx} ${ry} 0 0 0 ${cx} ${h} A${rx} ${ry} 0 0 0 ${cx - rx} ${y1} A${rx} ${ry} 0 0 0 ${cx} ${H / 2}` +
           ` A${rx} ${ry} 0 0 1 ${cx + rx} ${y2} A${rx} ${ry} 0 0 1 ${cx} ${H - h} A${rx} ${ry} 0 0 1 ${cx - rx} ${y2}`;
  }

  // ---------- Persiana de 2 módulos (26 × 40) ----------
  function persiana(x, heat) {
    const box = 40 * 0.16, pitch = (40 - box * 1.25) / 4, th = pitch * (0.42 + 0.5 * heat);
    let r = `<rect x="${x}" y="0" width="26" height="${box.toFixed(1)}"/>`;
    for (let j = 0; j < 4; j++) r += `<rect x="${x}" y="${(box * 1.25 + j * pitch + pitch - th).toFixed(1)}" width="26" height="${th.toFixed(1)}"/>`;
    return r;
  }

  // ---------- Logo completo ----------
  // state: 0–4 · variant: "full" | "sub" | "red" (SUD + CLUB) | "redsud" (solo SUD) · label: nombre de sub-marca
  function logo({ state = 0, variant = "full", label = "CLUB", ink = "currentColor", align = "xMinYMid", cls = "" } = {}) {
    const fixed = variant === "red" || variant === "redsud";         // las reducidas no cambian con la temperatura
    const i = fixed ? 0 : state;
    const c = fixed ? { ...CUSTOM[0], s: 20 } : CUSTOM[i];
    const heat = fixed ? 0.5 : i / 4;
    return build(c, heat, fixed ? 1 : STRETCH[i], variant, label, ink, align, cls);
  }

  // Logo a una temperatura cualquiera (18–44, con decimales): mezcla los estados vecinos. Para animaciones.
  function logoAt(t, { variant = "full", label = "CLUB", ink = "currentColor", align = "xMinYMid", cls = "" } = {}) {
    const T = STATES.map(s => s.t);                                  // 18, 26, 32, 38, 44
    let i = 0; while (i < T.length - 2 && t > T[i + 1]) i++;         // tramo en el que cae t
    const k = Math.max(0, Math.min(1, (t - T[i]) / (T[i + 1] - T[i]))); // proporción dentro del tramo
    const mix = (a, b) => a + (b - a) * k;                           // mezcla de dos números
    const c = { k: mix(CUSTOM[i].k, CUSTOM[i + 1].k), s: mix(CUSTOM[i].s, CUSTOM[i + 1].s), gap: mix(CUSTOM[i].gap, CUSTOM[i + 1].gap) };
    return build(c, (i + k) / 4, mix(STRETCH[i], STRETCH[i + 1]), variant, label, ink, align, cls); // persiana: mismo nivel de calor que en los estados fijos
  }

  // Construcción común (la misma geometría en todos los casos)
  function build(c, heat, sy, variant, label, ink, align, cls) {
    let x = 0, paths = "";
    for (const ch of ["S", "U", "D"]) { const W = BASEW[ch] * c.k; paths += `<path d="${glyph(ch, x, W, c.s)}"/>`; x += W + c.gap; } // letras
    const colX = x + 4, cw = 26;                                     // columna: espacio entre letras + 4 (¡no tocar!)
    let column = "", width = colX + cw, below = "", bottom = 0;
    if (variant === "full") column = `<g fill="${ink}">${persiana(colX, heat)}</g>` + vText("CLUB", colX + cw / 2, 100, 54, 19, ink);
    else if (variant === "sub") {
      column = `<g fill="${ink}">${persiana(colX, heat)}</g>`;
      below = `<line x1="0" x2="${width}" y1="114" y2="114" stroke="${ink}" stroke-width="2"/><text x="0" y="146" style="${MONO};font-size:28px;letter-spacing:.06em" fill="${ink}">${label}</text>`;
      bottom = 50;
    } else if (variant === "red") column = vText("CLUB", colX + cw / 2, 100, 100, 26, ink);
    else width = x - c.gap;                                          // solo SUD
    const lift = 100 * (sy - 1);                                     // lo que sube con el estirón
    const stretch = `translate(0 100) scale(1 ${sy}) translate(0 -100)`;
    return `<svg class="${cls}" viewBox="-2 ${(-4 - lift).toFixed(1)} ${width + 4} ${(108 + lift + bottom).toFixed(1)}" preserveAspectRatio="${align} meet" role="img" aria-label="SUD CLUB">` +
      `<g transform="${stretch}"><g fill="none" stroke="${ink}" stroke-width="${c.s}" stroke-linecap="butt">${paths}</g>${column}</g>${below}</svg>`;
  }
  function vText(txt, cx, bottom, len, size, ink) {                  // texto vertical, de abajo arriba
    return `<text transform="translate(${cx} ${bottom}) rotate(-90)" dominant-baseline="central" textLength="${len}" lengthAdjust="spacing" style="${MONO};font-size:${size}px" fill="${ink}">${txt}</text>`;
  }

  window.SUD = { STATES, CUSTOM, glyph, persiana, logo, logoAt };            // lo que se puede usar desde fuera
})();
