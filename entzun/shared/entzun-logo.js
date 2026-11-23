// entzun-logo.js · el logotipo de ENTZUN dibujado en código (copia única: todas las piezas lo usan desde aquí)
// Letras macizas sobre un alto de 100. La E nace de un semicírculo con dos cortes: es el gesto propio de la marca.
// Uso: <script src="../shared/entzun-logo.js"></script> y luego ENTZUN.logo({ color: "#121212" })
(function () {
  const ALTO = 100;                                                      // alto de las mayúsculas
  const TRACK = 7;                                                       // espacio entre letras
  const CORTE = 9;                                                       // grosor de los cortes de la E

  // ---------- Las letras ----------
  // Cada letra: ancho y forma. La E se dibuja aparte porque lleva cortes (máscara).
  const L = {
    N: { w: 80, d: "M0 0H28L52 56V0H80V100H52L28 44V100H0Z" },          // astas de 28 y diagonal maciza
    T: { w: 78, d: "M0 0H78V30H54V100H24V30H0Z" },                      // barra de 30 y asta de 30
    Z: { w: 76, d: "M0 0H76V28L36 72H76V100H0V72L40 28H0Z" },           // barras de 28 y diagonal gruesa
    U: { w: 84, d: "M0 0H30V58A12 12 0 0 0 54 58V0H84V58A42 42 0 0 1 0 58Z" }, // astas de 30 y fondo redondo
  };
  const E = { w: 88 };                                                   // la E: semicírculo de radio 50 + bloque recto

  // ---------- El guiño vasco ----------
  // Las letras de las estelas vascas (hilarriak) abren el pie de las astas en una cuña curva.
  // Aquí es mínimo: 5 de ancho y 9 de alto sobre 100. Se nota de cerca y desaparece a tamaño pequeño.
  const PIE = { a: 5, h: 9 };
  const ASTAS = {                                                        // dónde abrir cada letra: [x, lado, arriba/abajo]
    N: [[0, -1, 1], [28, 1, 1], [80, 1, 1]],                             // pies: fuera de la izquierda, dentro de la izquierda, fuera de la derecha
    T: [[24, -1, 1], [54, 1, 1]],                                        // los dos lados del pie de la T
    U: [[0, -1, 0], [30, 1, 0], [54, -1, 0], [84, 1, 0]],                // las cabezas de la U (arriba)
  };
  function pies(ch) {                                                    // las cuñas de una letra
    return (ASTAS[ch] || []).map(([x, lado, abajo]) => {
      const y = abajo ? 100 : 0, s = abajo ? -1 : 1;                     // abajo: la cuña sube; arriba: baja
      return `M${x} ${y + s * PIE.h}Q${x} ${y} ${x + lado * PIE.a} ${y}L${x} ${y}Z`; // curva cóncava hasta el pie
    }).join("");
  }

  let uid = 0;                                                           // para que cada máscara tenga su propio nombre
  // La E: un semicírculo (izquierda) unido a un bloque (derecha), con dos cortes horizontales desde la derecha
  function letraE(x, color) {
    const id = "ez-corte-" + (uid++);
    const forma = `M50 0H${E.w}V100H50A50 50 0 0 1 50 0Z`;              // semicírculo + bloque
    const c1 = 31, c2 = 100 - 31 - CORTE;                                // dónde empiezan los dos cortes
    return `<mask id="${id}"><path d="${forma}" fill="#fff"/>` +
      `<rect x="34" y="${c1}" width="${E.w}" height="${CORTE}" fill="#000"/>` +       // corte de arriba
      `<rect x="34" y="${c2}" width="${E.w}" height="${CORTE}" fill="#000"/></mask>` + // corte de abajo
      `<g transform="translate(${x} 0)"><path d="${forma}" fill="${color}" mask="url(#${id})"/></g>`;
  }

  // ---------- La palabra ----------
  function palabra(color = "currentColor", { vasco = true } = {}) {     // vasco: con o sin los pies de las estelas
    let x = 0, g = "";
    for (const ch of "ENTZUN") {
      if (ch === "E") { g += letraE(x, color); x += E.w + TRACK; continue; }
      g += `<path d="${L[ch].d}${vasco ? pies(ch) : ""}" transform="translate(${x} 0)" fill="${color}"/>`;
      x += L[ch].w + TRACK;
    }
    return { g, ancho: x - TRACK, alto: ALTO };
  }
  function logo({ color = "currentColor", vasco = true } = {}) {         // el logo como SVG listo para usar
    const p = palabra(color, { vasco });
    return `<svg viewBox="0 0 ${p.ancho} ${ALTO}" role="img" aria-label="ENTZUN">${p.g}</svg>`;
  }
  // ---------- El claim, con la misma letra del logo ----------
  // Letras nuevas con el mismo peso (astas de 28-30), las mismas curvas y los mismos pies vascos. El logo no cambia.
  const EXTRA = {
    S: { w: 76, d: "M34 0H76V27H36A7.5 7.5 0 0 0 36 42H44A29 29 0 0 1 44 100H0V73H42A7.5 7.5 0 0 0 42 58H34A29 29 0 0 1 34 0Z" }, // S de dos curvas
    I: { w: 30, d: "M0 0H30V100H0Z", pies: [[0, -1, 1], [30, 1, 1]] },   // asta sola
    M: { w: 104, d: "M0 0H30L52 46L74 0H104V100H76V48L58 84H46L28 48V100H0Z", pies: [[0, -1, 1], [28, 1, 1], [76, -1, 1], [104, 1, 1]] }, // dos astas y una V
    C: { w: 84, d: "M50 0H84V29H50A21 21 0 0 0 50 71H84V100H50A50 50 0 0 1 50 0Z" }, // el semicírculo de la E, abierto
    A: { w: 92, d: "M30 0H62L92 100H62L58 84H34L30 100H0ZM40 60H52L46 34Z" }, // A con su contraforma
    D: { w: 86, d: "M0 0H36A50 50 0 0 1 36 100H0ZM29 28V72H36A22 22 0 0 0 36 28Z", pies: [[0, -1, 1]] }, // D redonda
    F: { w: 70, d: "M0 0H70V28H30V40H62V66H30V100H0Z", pies: [[0, -1, 1], [30, 1, 1]] }, // F con el pie de las estelas
    O: { w: 100, d: "M50 0A50 50 0 0 1 50 100A50 50 0 0 1 50 0ZM50 29A21 21 0 0 0 50 71A21 21 0 0 0 50 29Z" }, // círculo perfecto
    B: { w: 84, d: "M0 0H50A26 26 0 0 1 68 45A29 29 0 0 1 52 100H0ZM29 25V38H46A6.5 6.5 0 0 0 46 25ZM29 60V75H48A7.5 7.5 0 0 0 48 60Z", pies: [[0, -1, 1]] }, // B de dos curvas
    G: { w: 96, d: "M50 0H90V29H50A21 21 0 0 0 50 71H67V62H52V40H96V100H50A50 50 0 0 1 50 0Z" }, // la C cerrada con una barra
    H: { w: 84, d: "M0 0H30V36H54V0H84V100H54V63H30V100H0Z", pies: [[0, -1, 1], [30, 1, 1], [54, -1, 1], [84, 1, 1]] }, // dos astas
    J: { w: 66, d: "M36 0H66V66A33 33 0 0 1 0 66V58H29V66A4 4 0 0 0 37 66Z" }, // J con curva
    K: { w: 88, d: "M0 0H30V38L54 0H86L56 46L88 100H55L30 58V100H0Z", pies: [[0, -1, 1], [30, 1, 1]] }, // K de diagonales
    L: { w: 66, d: "M0 0H30V72H66V100H0Z", pies: [[0, -1, 1]] },      // L con base
    P: { w: 80, d: "M0 0H48A32 32 0 0 1 48 64H30V100H0ZM30 26V38H45A6 6 0 0 0 45 26Z", pies: [[0, -1, 1], [30, 1, 1]] }, // P redonda
    Q: { w: 104, d: "M50 0A50 50 0 0 1 50 100A50 50 0 0 1 50 0ZM50 29A21 21 0 0 0 50 71A21 21 0 0 0 50 29Z", cola: "M58 66H86L104 100H76Z" }, // la O con cola
    R: { w: 88, d: "M0 0H50A32 32 0 0 1 64 61L88 100H56L36 65H30V100H0ZM30 26V40H46A7 7 0 0 0 46 26Z", pies: [[0, -1, 1], [30, 1, 1]] }, // R con pierna
    V: { w: 92, d: "M0 0H32L46 58L60 0H92L62 100H30Z" },                // V maciza
    W: { w: 132, d: "M0 0H30L40 56L52 0H80L92 56L102 0H132L108 100H78L66 46L54 100H24Z" }, // doble V
    X: { w: 88, d: "M0 0H33L43 28L53 0H86L60 49L88 100H55L43 70L31 100H0L27 50Z" }, // X
    Y: { w: 86, d: "M0 0H33L43 34L53 0H86L58 58V100H28V58Z" },          // Y
    ".": { w: 28, d: "M14 72A14 14 0 0 1 14 100A14 14 0 0 1 14 72Z" },   // el punto, redondo
  };
  const ACENTO = "M36 -9L50 -27H72L54 -9Z";                              // la tilde de la Ú, en cuña
  const ESPACIO = 44;                                                    // hueco entre palabras
  const AIRE = 14;                                                       // entre letras del claim: más que en el logo, para que los pies no se toquen
  const cunas = (lista) => lista.map(([x, lado, abajo]) => {             // los pies vascos de las letras nuevas
    const y = abajo ? 100 : 0, c = abajo ? -1 : 1;                       // abajo la cuña sube; arriba baja
    return `M${x} ${y + c * PIE.h}Q${x} ${y} ${x + lado * PIE.a} ${y}L${x} ${y}Z`; // misma curva que en el logo
  }).join("");
  const SIN_TILDE = { Á: "A", É: "E", Í: "I", Ó: "O", Ú: "U" };           // las vocales con tilde usan su letra base
  function linea(texto, color) {                                         // dibuja una línea de texto
    let x = 0, g = "";                                                   // posición y dibujo
    for (const ch of texto) {                                            // letra a letra
      if (ch === " ") { x += ESPACIO - AIRE; continue; }                 // espacio entre palabras
      const base = SIN_TILDE[ch] || ch;                                  // la letra sin tilde
      const l = base === "E" ? E : (EXTRA[base] || L[base]);             // busca su forma
      if (!l) continue;                                                  // un signo que no existe no rompe la palabra
      if (base === "E") g += letraE(x, color);                           // la E propia de la marca, con sus cortes
      else {
        const extra = EXTRA[base] ? cunas(l.pies || []) : pies(base);    // sus pies vascos
        g += `<path fill-rule="evenodd" d="${l.d}${extra}" transform="translate(${x} 0)" fill="${color}"/>`; // la letra
        if (l.cola) g += `<path d="${l.cola}" transform="translate(${x} 0)" fill="${color}"/>`; // la cola de la Q
      }
      if (SIN_TILDE[ch]) g += `<path d="${ACENTO}" transform="translate(${x + l.w / 2 - 42} 0)" fill="${color}"/>`; // la tilde, centrada
      x += l.w + AIRE;                                                   // avanza a la siguiente
    }
    return { g, ancho: x - AIRE };                                       // dibujo y ancho final
  }
  function rotula(el) {                                                  // convierte un título de texto en la letra de la marca
    if (el.dataset.rotulado) return;                                     // no lo hace dos veces
    const texto = el.textContent.trim();                                 // el título real
    el.dataset.rotulado = "1"; el.setAttribute("aria-label", texto);     // los lectores de pantalla siguen leyéndolo
    const palabras = texto.toUpperCase().split(/\s+/);                   // las palabras del título
    el.innerHTML = palabras.map((p, i) => {                              // palabra a palabra, para que corte bien de línea
      const l = linea(p, "currentColor");                                // la dibuja
      return `<span class="palabra" aria-hidden="true"><svg viewBox="0 -30 ${l.ancho} 130">${l.g}</svg></span>${el.classList.contains("con-salto") && p.endsWith(".") && i < palabras.length - 1 ? '<span class="salto"></span>' : ""}`; // salto tras el punto, si el título lo pide // con sitio arriba para la tilde
    }).join("");
  }
  function lema({ color = "currentColor", lineas = ["SIN MÚSICA", "DE FONDO."] } = {}) { // el claim como SVG, en una o varias líneas
    const PASO = 138, ARRIBA = 30;                                       // distancia entre líneas y sitio para la tilde
    const ls = lineas.map((t) => linea(t, color));                       // dibuja cada línea
    const ancho = Math.max(...ls.map((l) => l.ancho));                   // la más larga marca el ancho
    const alto = ARRIBA + 100 + PASO * (ls.length - 1);                  // alto total
    const g = ls.map((l, i) => `<g transform="translate(0 ${i * PASO})">${l.g}</g>`).join(""); // apila las líneas
    return `<svg viewBox="0 ${-ARRIBA} ${ancho} ${alto}" aria-hidden="true">${g}</svg>`; // listo para usar
  }
  window.ENTZUN = { palabra, logo, lema, rotula, letraE, L, E, ALTO, TRACK, PIE };  // lo que se puede usar desde fuera
})();
