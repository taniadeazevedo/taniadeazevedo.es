// web.js · datos y piezas comunes de la web de ENTZUN
// Necesita antes: ../shared/entzun-logo.js y ../shared/entzun-sistema.js (logo, glifos y discos, copia única)

// ---------- Cómo es una sesión ----------
// Una sesión por noche, con dos discos que se complementan: disco A entero, descanso y disco B entero.
// Se puede venir a la sesión completa o solo a uno de los dos discos (media sesión).
const AFORO = 30;                                                          // sitios por disco
const DESCANSO = 20;                                                       // minutos entre disco A y disco B

// ---------- La programación (ficticia) ----------
// [nº, fecha, hora, título, hilo, disco A, disco B, libres en A, libres en B]
const PROGRAMA = [
  [24, "2026-11-19", "21:00", "La voz de Bristol", "Dos discos unidos por una voz reconocible y una forma muy particular de crear atmósferas.", 24, 29, 6, 9],
  [25, "2026-11-20", "21:00", "Calor lento", "Guitarras cálidas, groove suave y raíces brasileñas. Una sesión luminosa, elegante y muy agradable.", 25, 28, 14, 18],
  [26, "2026-11-21", "21:00", "Dos voces", "Soul, voz, vulnerabilidad y presencia. Una conversación entre dos intérpretes con una personalidad enorme.", 26, 36, 0, 4],
  [27, "2026-11-24", "21:00", "Electrónica que respira", "Electrónica delicada, atmósferas y producción envolvente. Del downtempo francés a una sensibilidad electrónica actual.", 32, 34, 22, 20],
  [28, "2026-11-25", "21:00", "Después de medianoche", "Dos universos lentos, envolventes y cinematográficos. Americana oscura, guitarras y voces que parecen flotar.", 30, 27, 3, 7],
  [29, "2026-11-26", "21:00", "Canciones que se quedan", "Folk, electrónica sutil y canciones llenas de matices. Una combinación íntima, cálida y muy de escuchar de principio a fin.", 33, 35, 12, 16],
];
const ARCHIVO = [                                                          // sesiones ya escuchadas: [nº, título, disco A, disco B]
  [21, "Jazz de madrugada", 18, 37], [22, "Nueva York y Berlín", 21, 23], [23, "Ritmos raros", 31, 20],
];
const TEXTOS = {                                                           // un texto corto por disco
  24: "Un álbum que mezcla trip-hop, jazz, soul y texturas cinematográficas. Una escucha llena de contrastes, silencios y tensión contenida.",
  29: "Una voz que regresa desde otro lugar. Un disco íntimo, pausado y atmosférico que mantiene esa intensidad emocional sin necesidad de levantar la voz.",
  25: "El primer gran disco de Djavan: voz, guitarra y un groove brasileño que suena a calor de última hora de la tarde.",
  28: "Un trío de Texas que mira al sur: guitarras cálidas, bajo redondo y ritmos que nunca tienen prisa.",
  26: "Nina Simone y su piano, del blues al góspel, hasta los diez minutos de «Sinnerman».",
  36: "Un debut desnudo y muy de cerca: una voz grave que llena la sala sin forzar nada.",
  32: "Dos franceses, sintetizadores analógicos y una luna: el downtempo más suave de finales de los noventa.",
  34: "Pop electrónico de hoy, hecho de capas y aire. Delicado, cercano y muy de escuchar con atención.",
  30: "Guitarras lentas, reverberación y la voz de Hope Sandoval flotando por encima. Un disco para bajar la luz.",
  27: "Un disco largo y cinematográfico sobre el sur de Estados Unidos: americana oscura que se escucha como una película.",
  33: "Folk con electrónica de fondo: canciones cálidas, una voz muy cercana y producción de finales de los noventa.",
  35: "Folk que corre: piano, cuerdas y batería constante para hablar de lo que preferimos no mirar.",
};
const CANCIONES = {                                                        // las canciones, cuando las tenemos (cara A / cara B del vinilo)
  24: [["Mysterons", "Sour Times", "Strangers", "It Could Be Sweet", "Wandering Star"], ["It's a Fire", "Numb", "Roads", "Pedestal", "Biscuit", "Glory Box"]],
};

// ---------- Ayudas ----------
const disco = (id) => DISCOS.find((d) => d[0] === id);                    // [id, artista, álbum, año, min, canciones]
const sesion = (n) => PROGRAMA.find((s) => s[0] === n);
const nn = (n) => String(n).padStart(3, "0");                              // 24 → 024
const DIAS = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];
const MESES = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
function fechaLarga(iso) { const d = new Date(iso + "T12:00"); return `${DIAS[d.getDay()]} ${d.getDate()} de ${MESES[d.getMonth()]}`; }
function fechaCorta(iso) { const [, m, d] = iso.split("-"); return `${d}.${m}`; }
function sumaHora(hhmm, min) { const [h, m] = hhmm.split(":").map(Number), t = h * 60 + m + min; return `${String(Math.floor(t / 60) % 24).padStart(2, "0")}:${String(t % 60).padStart(2, "0")}`; }
function horario(s) {                                                      // a qué hora empieza y acaba cada parte
  const a = disco(s[5]), b = disco(s[6]);
  const finA = sumaHora(s[2], a[4]), iniB = sumaHora(finA, DESCANSO), finB = sumaHora(iniB, b[4]);
  return { iniA: s[2], finA, iniB, finB };
}
function estado(libres) {                                                  // texto y clase de disponibilidad
  if (libres === 0) return { txt: "Completo", cls: "completo" };
  if (libres <= 6) return { txt: `Quedan ${libres}`, cls: "pocas" };
  return { txt: `${libres} sitios`, cls: "" };
}
const libresCompleta = (s) => Math.min(s[7], s[8]);                        // para venir entera, hace falta sitio en los dos discos
const PLATA = "#D4D5D6";                                                   // el gris metalizado de la marca, liso y sin efectos
// El trazo de .35 cierra la línea finísima que se ve donde se tocan las celdas
function glifoSVG(id, color = "currentColor") {                                 // el glifo de un disco
  const d = disco(id); return `<svg viewBox="0 0 100 100" aria-hidden="true"><g fill="${color}" stroke="${color}" stroke-width=".35">${glifo(id, d[5])}</g></svg>`;
}
function parSVG(s, color = "currentColor") {                                    // la sesión: el glifo del disco A y el del disco B, uno junto al otro
  return `<span class="par-a">${glifoSVG(s[5], color)}</span><span class="par-b">${glifoSVG(s[6], color)}</span>`;
}
function logoSVG(color = PLATA) { return ENTZUN.logo({ color }); }

// ---------- La noche como línea: cada tramo mide lo que dura de verdad ----------
function nocheHTML(s) {
  const a = disco(s[5]), b = disco(s[6]), h = horario(s);                  // los dos discos y sus horas
  const tramo = (l, d, ini, fin) => `<div class="tramo"><span class="gl">${glifoSVG(d[0])}</span>
    <p class="k gris">Disco ${l} · ${ini}–${fin}</p><p class="quien">${d[1]}</p><p class="gris">${d[2]} · ${d[3]}</p></div>`; // un disco: glifo, hora y datos
  return `<div class="noche-linea" style="--tramos: minmax(0, ${a[4]}fr) minmax(116px, ${DESCANSO}fr) minmax(0, ${b[4]}fr)">${tramo("A", a, h.iniA, h.finA)}
    <div class="tramo pausa"><p class="k gris">Descanso</p><p class="quien">${DESCANSO} min</p></div>${tramo("B", b, h.iniB, h.finB)}</div>`; // A, silencio y B
}

// ---------- El descanso: una franja que explica el paso del disco A al disco B ----------
function descansoHTML(s) {
  const a = disco(s[5]), b = disco(s[6]);                                  // los dos discos de la sesión
  return `<section class="descanso" id="descanso" aria-label="Paso del disco de ${a[1]} al de ${b[1]}"><div class="franja"><div class="losas" aria-hidden="true"></div></div></section>`; // solo el patrón que gira
}
function descansoVivo(s, bucle = false) {                                  // bucle: se mueve sola (para la newsletter, donde no hay scroll propio)
  const caja = document.getElementById("descanso"), losas = caja.querySelector(".losas"); // la franja y su retícula
  const A = adn(s[5], disco(s[5])[5]), B = adn(s[6], disco(s[6])[5]);       // la forma de cada disco: A delante, B detrás
  const quieto = matchMedia("(prefers-reduced-motion: reduce)").matches;    // quien prefiere sin movimiento ve una pose fija
  let lista = [], pedido = false;                                           // las losas y si ya hay un dibujo pendiente
  const cara = (d, c, f, vacia, cls) => `<span class="cara ${cls}"><svg viewBox="0 0 50 50"><g fill="currentColor" stroke="currentColor" stroke-width=".5">${vacia ? "" : celda(d.forma, (d.giro + c + f * 3) % 4)}</g></svg></span>`; // una cara de la losa
  function montar() {                                                       // crea las losas de la franja
    const w = losas.clientWidth, cols = w < 700 ? 12 : 24, t = Math.ceil(w / cols), filas = 2; // columnas, tamaño y dos filas
    let html = "";                                                          // aquí se va escribiendo la retícula
    for (let f = 0; f < filas; f++) for (let c = 0; c < cols; c++) {        // fila a fila, columna a columna
      const vacia = false;                                                  // la franja va entera, sin hueco
      html += `<div class="losa" data-d="${c / (cols - 1)}">${cara(A, c, f, vacia, "")}${cara(B, c, f, vacia, "atras")}</div>`; // delante A, detrás B
    }
    losas.style.gridTemplateColumns = `repeat(${cols}, ${t}px)`;            // la retícula exacta
    losas.style.gridAutoRows = `${t}px`;                                    // losas cuadradas
    caja.querySelector(".franja").style.height = `${t * filas}px`;          // la franja mide justo dos filas
    losas.innerHTML = html;                                                 // las pinta
    lista = [...losas.children].map((el) => ({ el, d: +el.dataset.d, ult: -1 })); // las recuerda para moverlas
    dibuja();                                                               // las coloca según el scroll
  }
  function dibuja() {                                                       // gira las losas mientras la franja cruza la pantalla
    pedido = false;                                                         // ya se está dibujando
    const r = losas.getBoundingClientRect(), alto = innerHeight;            // posición de la franja y alto de la ventana
    const u = (performance.now() % 7000) / 7000;                            // momento del bucle
    const p = quieto ? 1 : bucle ? (u < .45 ? Math.min(1, u / .36) : Math.max(0, 1 - (u - .5) / .36)) : Math.min(1, Math.max(0, (alto * .92 - r.top) / (alto * .62))); // en bucle va de A a B y vuelve; si no, sigue al scroll
    for (const l of lista) {                                                // losa a losa
      const t = Math.min(1, Math.max(0, (p - l.d * .75) / .25));            // de izquierda a derecha: de A hacia B
      const g = Math.round((t * t * (3 - 2 * t)) * 180);                    // giro suave, de 0 a 180 grados
      if (g !== l.ult) { l.el.style.transform = `perspective(500px) rotateY(${g}deg)`; l.ult = g; } // solo toca las que cambian
    }
  }
  const pide = () => { if (!pedido) { pedido = true; requestAnimationFrame(dibuja); } }; // un dibujo por fotograma
  addEventListener("scroll", pide, { passive: true });                      // al bajar
  addEventListener("resize", montar);                                       // al cambiar de tamaño
  montar();                                                                 // primera vez
  if (bucle && !quieto) { let vista = true; new IntersectionObserver(([e]) => { vista = e.isIntersecting; }).observe(document.body); (function gira() { if (vista) dibuja(); requestAnimationFrame(gira); })(); } // en bucle, un dibujo por fotograma, solo si se ve
}

// ---------- El eco: la forma de la portada se repite como un sonido que rebota ----------
function ecoHero() {
  const caja = document.getElementById("ecoHero"), svg = caja.querySelector("svg"), forma = svg.querySelector("#ecoForma path"), foto = svg.querySelector("image"); // la portada y sus piezas
  const CENTROS = [0, .874, 1.395, 1.769, 1.769];                           // por dónde pasa el círculo de cada onda (en radios)
  const CORTES = [0, .899, 1.853, 2.496, 2.773];                            // por dónde pasa su corte recto: al final alcanza el borde y la onda desaparece
  const VUELTA = 1200, ONDAS = 4, ANCHO = 3.77;                             // una onda tarda 1,2 s en ocupar el sitio de la siguiente
  const quieto = matchMedia("(prefers-reduced-motion: reduce)").matches;    // sin movimiento si la persona lo prefiere
  let W = 0, Hh = 0, R = 0, cx = 0, cy = 0, vertical = false, visible = true; // medidas y estado
  const circulo = (x, y) => `M${x - R} ${y}a${R} ${R} 0 1 1 ${2 * R} 0a${R} ${R} 0 1 1 ${-2 * R} 0Z`; // el círculo fijo
  const tramo = (lista, q) => { const i = Math.min(Math.floor(q), lista.length - 2); return lista[i] + (lista[i + 1] - lista[i]) * (q - i); }; // posición entre dos puntos, a velocidad constante
  function onda(q) {                                                        // una onda: círculo desplazado y cortado por una recta
    const m = tramo(CENTROS, q) * R, u = tramo(CORTES, q) * R, dx = u - m;  // su centro, su corte y la distancia entre ambos
    if (dx >= R) return "";                                                 // ya ha salido: no se dibuja
    const v = Math.sqrt(R * R - dx * dx), grande = dx < 0 ? 1 : 0;          // alto del corte y qué arco toca
    const P = (a, b) => vertical ? `${cx + b} ${cy + a}` : `${cx + a} ${cy + b}`; // en móvil, la onda baja en lugar de ir a la derecha
    return vertical ? `M${P(u, v)}A${R} ${R} 0 ${grande} 1 ${P(u, -v)}Z` : `M${P(u, -v)}A${R} ${R} 0 ${grande} 1 ${P(u, v)}Z`; // arco por fuera y recta de vuelta
  }
  function pinta(fase) {                                                    // dibuja el círculo y las cuatro ondas
    let d = circulo(cx, cy);                                                // el círculo no se mueve
    for (let k = 0; k < ONDAS; k++) d += onda(k + fase);                    // cada onda va una posición por delante
    forma.setAttribute("d", d);                                             // lo aplica a la foto
  }
  function medir() {                                                        // calcula el tamaño según la pantalla
    W = caja.clientWidth; Hh = caja.clientHeight; vertical = W < 760;       // ancho, alto y orientación
    R = vertical ? Math.min((W - 32) / 2, (Hh - 120) / ANCHO) : Math.min(Hh * .45, (W - 48) / ANCHO); // el radio que cabe
    cx = vertical ? W / 2 : (W - ANCHO * R) / 2 + R; cy = vertical ? 24 + R : Hh / 2 - 8; // dónde está el círculo
    svg.setAttribute("viewBox", `0 0 ${W} ${Hh}`);                          // el lienzo mide lo que la portada
    const largo = (ANCHO + .03) * R;                                        // lo que ocupa el eco a lo largo
    foto.setAttribute("x", cx - R); foto.setAttribute("y", cy - R);         // la foto empieza en el círculo
    foto.setAttribute("width", vertical ? 2 * R : largo); foto.setAttribute("height", vertical ? largo : 2 * R); // y cubre todo el eco
    pinta(0);                                                               // primer dibujo
  }
  function bucle(t) {                                                       // el movimiento continuo
    if (visible) pinta((t % VUELTA) / VUELTA);                              // solo trabaja si la portada se ve
    requestAnimationFrame(bucle);                                           // siguiente fotograma
  }
  new IntersectionObserver(([e]) => { visible = e.isIntersecting; }).observe(caja); // se detiene al salir de pantalla
  addEventListener("resize", medir);                                        // al cambiar de tamaño
  medir();                                                                  // primera vez
  if (!quieto) requestAnimationFrame(bucle);                                // arranca, salvo que se prefiera sin movimiento
}
function ecoMarca() {                                                       // el logo final: cinco copias que se juntan al bajar
  const caja = document.getElementById("ecoMarca"), SALTOS = [-2, -1, 0, 1, 2]; // el lienzo y la posición de cada copia
  caja.innerHTML = SALTOS.map(() => `<div class="copia">${ENTZUN.logo({ color: "#D4D5D6" })}</div>`).join(""); // las copias: donde se pisan, se recortan
  const copias = [...caja.children];                                        // para moverlas
  const quieto = matchMedia("(prefers-reduced-motion: reduce)").matches;    // sin movimiento si se prefiere
  let pedido = false;                                                       // si ya hay un dibujo pendiente
  function pinta() {                                                        // separa las copias según el scroll
    pedido = false;                                                         // ya se está dibujando
    const r = caja.getBoundingClientRect(), p = quieto ? 1 : Math.min(1, Math.max(0, (innerHeight - r.top) / (innerHeight * .72))); // 0 al entrar, 1 al asentarse
    const abre = (1 - p * p * (3 - 2 * p)) * 3.6;                           // cuánto se separan (en % del ancho)
    copias.forEach((c, i) => { c.style.transform = `translateX(${SALTOS[i] * abre}%)`; }); // cada copia a su sitio
  }
  addEventListener("scroll", () => { if (!pedido) { pedido = true; requestAnimationFrame(pinta); } }, { passive: true }); // al bajar
  pinta();                                                                  // primera vez
}

// ---------- Una sesión en lista (portada y programación) ----------
function sesionFila(s) {
  const [n, fecha, hora, titulo, , ia, ib] = s, a = disco(ia), b = disco(ib), e = estado(libresCompleta(s));
  return `<a class="sesion" href="sesion.html?n=${n}"><span class="gl par">${parSVG(s)}</span><span class="k gris">Nº ${nn(n)}</span>
    <span><span class="art">${titulo}</span><br><span class="alb">${a[1]} · ${b[1]}</span></span>
    <span class="der k" style="text-align:right"><span class="hora">${fechaCorta(fecha)} · ${hora}</span><br><span class="plazas ${e.cls}">${e.txt}</span></span></a>`;
}

// ---------- Cabecera y pie comunes ----------
function cabecera(actual) {
  const a = (href, txt, cls = "") => `<a href="${href}" class="k ${cls}" ${actual === href ? 'aria-current="page"' : ""}>${txt}</a>`;
  const prox = PROGRAMA.find((s) => s[7] > 0 || s[8] > 0);
  document.body.insertAdjacentHTML("afterbegin", `<a class="salta k" href="#contenido">Saltar al contenido</a>
    <header class="cab"><div class="wrap"><a class="marca" href="index.html" aria-label="ENTZUN, inicio">${logoSVG()}</a>
    <nav aria-label="Principal">${a("programacion.html", "Programación")}${a("index.html#espacio", "El espacio", "solo-escritorio")}${a(`reservar.html?n=${prox[0]}`, "Reservar")}</nav></div><span class="aguja" aria-hidden="true"></span></header>`);
  document.querySelectorAll(".t-logo").forEach(ENTZUN.rotula);            // los títulos, con la letra de la marca
  const aguja = document.querySelector(".aguja");                          // la línea que avanza como una aguja sobre el disco
  const avanza = () => { const total = document.documentElement.scrollHeight - innerHeight; aguja.style.transform = `scaleX(${total > 0 ? scrollY / total : 0})`; }; // cuánto se ha «escuchado» de la página
  addEventListener("scroll", avanza, { passive: true }); addEventListener("resize", avanza); avanza(); // se actualiza al moverse
}
function pie() {
  document.body.insertAdjacentHTML("beforeend", `<footer class="pie"><div class="wrap">
    <div><div class="pie-lema" role="img" aria-label="Sin música de fondo.">${ENTZUN.lema({ color: PLATA })}</div><p>Un espacio para escuchar.<br>Entzuteko gune bat.</p></div>
    <div><b class="k">Dónde</b><p>Calle San Francisco 31, bajo<br>Bilbao La Vieja · 48003 Bilbao</p></div>
    <div><b class="k">Cuándo</b><p>De martes a sábado<br>Sesiones desde las 21:00</p></div>
    <div><b class="k">Contacto</b><p>kaixo@entzun.eus<br>@entzun.bilbao</p><p class="enlaces"><a href="#">Instagram</a> · <a href="#">Contacto</a> · <a href="#">Cómo llegar</a></p></div>
    </div></footer>`);
}
