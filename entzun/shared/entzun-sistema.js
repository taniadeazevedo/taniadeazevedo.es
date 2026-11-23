// entzun-sistema.js · el sistema gráfico de ENTZUN (copia única: todas las piezas lo usan desde aquí)
// Glifos de sesión (retícula 2 × 2), patrones y la lista de sesiones de ejemplo.
// Uso: <script src="../shared/entzun-sistema.js"></script> después de entzun-logo.js
// ================= Las formas de una celda (50 × 50) =================
const FORMAS = [
  "",                                                                    // 0 · vacía
  `<path d="M50 50H0A50 50 0 0 1 50 0Z"/>`,                              // 1 · cuarto de círculo
  `<path d="M0 50A25 25 0 0 1 50 50Z"/>`,                                // 2 · semicírculo
  `<circle cx="25" cy="25" r="25"/>`,                                    // 3 · círculo
  `<path d="M0 0H50L0 50Z"/>`,                                           // 4 · triángulo (media celda)
  `<path d="M0 50A50 50 0 0 1 50 0A50 50 0 0 1 0 50Z"/>`,                // 5 · pétalo (dos arcos que se cruzan)
  `<path d="M0 0L25 25L50 0Z"/><path d="M0 50L25 25L50 50Z"/>`,          // 6 · reloj de arena (dos triángulos)
];
const celda = (tipo, giro) => `<g transform="rotate(${giro * 90} 25 25)">${FORMAS[tipo]}</g>`; // una celda con su orientación
function azar(semilla) { let a = semilla >>> 0; return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; } // azar repetible

// Cada disco elige su forma y su giro a partir de sus datos (siempre la misma para el mismo disco)
function adn(sesion, canciones) {
  const r = azar(sesion * 131 + canciones * 7);
  if (sesion === 36) return { forma: 1, giro: 1, otra: 4, giro2: 3 };    // Annahstasia: forma propia, para no repetir el glifo de Khruangbin
  const gira = sesion % 2 === 0;                                         // los pares giran: el círculo no sirve (girado no cambia)
  const formas = gira ? [1, 2, 4, 5, 6, 1, 5] : [1, 2, 3, 4, 5, 6, 1, 5];
  return { forma: formas[Math.floor(r() * formas.length)], giro: Math.floor(r() * 4), otra: [1, 2, 4, 5][Math.floor(r() * 4)], giro2: Math.floor(r() * 4) };
}
// El glifo: retícula de 2 × 2. Par: gira sobre sí mismo. Impar: dos mitades en espejo (cara A y cara B).
function glifo(sesion, canciones) {
  const d = adn(sesion, canciones);
  if (sesion % 2 === 0) { const c = celda(d.forma, d.giro); return [0, 1, 2, 3].map((k) => `<g transform="rotate(${k * 90} 50 50)">${c}</g>`).join(""); }
  const izq = `${celda(d.forma, d.giro)}<g transform="translate(0 50)">${celda(d.otra, d.giro2)}</g>`;
  return izq + `<g transform="translate(100 0) scale(-1 1)">${izq}</g>`;
}
// El patrón: la forma de la sesión repetida en una retícula, girando en damero (de ahí salen las rosetas)
function patron(sesion, canciones, cols, filas, tam = 50, forzar) {    // forzar: usar una forma concreta (para la muestra de patrones)
  const d = forzar ? { forma: forzar, giro: 0 } : adn(sesion, canciones); let g = "";
  for (let f = 0; f < filas; f++) for (let c = 0; c < cols; c++)
    g += `<g transform="translate(${c * tam} ${f * tam}) scale(${tam / 50})">${celda(d.forma, (d.giro + c + f * 3) % 4)}</g>`;
  return g;
}

const SESIONES = [                                                         // cada disco: [id, artista, álbum, año, minutos, canciones] (minutos aproximados)
  // esta semana: el id marca su sitio (024 A, 024 B…) y de él sale su glifo
  [24, "Portishead", "Dummy", 1994, 49, 11], [29, "Beth Gibbons", "Lives Outgrown", 2024, 48, 10],
  [25, "Djavan", "A Voz, o Violão, a Música de Djavan", 1976, 39, 12], [28, "Khruangbin", "Con Todo El Mundo", 2018, 39, 10],
  [26, "Nina Simone", "Pastel Blues", 1965, 41, 9], [36, "Annahstasia", "Tether", 2025, 45, 11],
  [32, "Air", "Moon Safari", 1998, 43, 10], [34, "Oklou", "choke enough", 2025, 41, 13],
  [30, "Mazzy Star", "So Tonight That I Might See", 1993, 50, 10], [27, "Ethel Cain", "Preacher's Daughter", 2022, 76, 13],
  [33, "Beth Orton", "Trailer Park", 1996, 55, 11], [35, "The Weather Station", "Ignorance", 2021, 41, 10],
  // el archivo: sesiones ya escuchadas
  [18, "Miles Davis", "Kind of Blue", 1959, 46, 5], [37, "John Coltrane", "A Love Supreme", 1965, 33, 4],
  [21, "The Velvet Underground", "& Nico", 1967, 48, 11], [23, "David Bowie", "Low", 1977, 38, 11],
  [31, "Talking Heads", "Remain in Light", 1980, 40, 8], [20, "Björk", "Homogenic", 1997, 44, 10],
];
const DISCOS = SESIONES;                                                   // cada fila es un disco: [id, artista, álbum, año, min, canciones]
// Cada sesión tiene dos discos que se complementan: el disco A y el disco B. Código de cada disco dentro de su sesión:
const CODIGO = { 24: "024 A", 29: "024 B", 25: "025 A", 28: "025 B", 26: "026 A", 36: "026 B", 32: "027 A", 34: "027 B",
  30: "028 A", 27: "028 B", 33: "029 A", 35: "029 B", 18: "021 A", 37: "021 B", 21: "022 A", 23: "022 B", 31: "023 A", 20: "023 B" };
const codigo = (id) => CODIGO[id] || String(id).padStart(3, "0");     // 29 → «024 B»
