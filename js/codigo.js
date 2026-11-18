/* =====================================================================
   VISOR DE CÓDIGO ("El esqueleto, por dentro") — página de caso de Fit Bites
   Enseña el código REAL de la app (HTML, CSS y JavaScript) con sus comentarios de línea,
   sin tocar la app. Tiene:
   - pestañas HTML / CSS / JavaScript y, dentro de JavaScript, un archivo por botón
   - un interruptor "Con comentarios / Solo código"
   - cuatro etiquetas C · R · U · D que iluminan las líneas de cada operación del CRUD
   Los archivos se piden solo cuando se abren (están en fit-bites/codigo/*.txt).
   ===================================================================== */
(function () {
  var raiz = document.getElementById('visorCodigo');                      // el hueco de la página donde se dibuja el visor
  if (!raiz) return;                                                      // si esta página no lo tiene, no hace nada

  var GITHUB = 'https://github.com/taniadeazevedo/fit-bites/blob/main/';  // el repositorio de la app (para el enlace "ver completo")
  var CARPETA = raiz.getAttribute('data-carpeta') || 'codigo/';           // dónde están las copias del código

  // ---- QUÉ SE PUEDE VER ----
  // desde = número de la primera línea en el archivo original (para que los números coincidan con tu repositorio)
  // crud = rangos [primera línea, última línea, letra]: c = crear, r = leer, u = actualizar, d = borrar
  var GRUPOS = [
    { id: 'html', nombre: 'HTML', archivos: [
      { f: 'index.html.txt', nombre: 'index.html', lang: 'html', desde: 1, repo: 'index.html',
        nota: 'Extracto (líneas 1–273): cabecera, barra superior, portada, diario y recetas. Después vienen las ventanas emergentes.' }
    ] },
    { id: 'css', nombre: 'CSS', archivos: [
      { f: 'estilos.css.txt', nombre: 'estilos.css', lang: 'css', desde: 1, repo: 'css/estilos.css',
        nota: 'Extracto (líneas 1–99): colores y medidas como variables, y el tema oscuro.' }
    ] },
    { id: 'js', nombre: 'JavaScript', archivos: [
      { f: 'datos.js.txt', nombre: 'datos.js', lang: 'js', desde: 1, repo: 'js/datos.js',
        nota: 'El CRUD: cada operación es una función con su verbo HTTP.',
        crud: [[13, 40, 'r'], [42, 55, 'c'], [57, 70, 'u'], [72, 79, 'd']] },
      { f: 'formulario.js.txt', nombre: 'formulario.js', lang: 'js', desde: 123, repo: 'js/formulario.js',
        nota: 'Extracto (líneas 123–166): al enviar el formulario se decide si es crear (POST) o editar (PUT).',
        crud: [[149, 150, 'u'], [151, 152, 'c'], [157, 157, 'r']] },
      { f: 'recetas.js.txt', nombre: 'recetas.js', lang: 'js', desde: 331, repo: 'js/recetas.js',
        nota: 'Extracto (líneas 331–343): el botón «Sí, borrar» llama a DELETE y vuelve a pedir la lista.',
        crud: [[334, 334, 'd'], [336, 336, 'r']] },
      { f: 'estado.js.txt', nombre: 'estado.js', lang: 'js', desde: 1, repo: 'js/estado.js',
        nota: 'Lo que comparten todos los archivos: la lista de recetas cargada.' },
      { f: 'almacen.js.txt', nombre: 'almacen.js', lang: 'js', desde: 1, repo: 'js/almacen.js',
        nota: 'Los datos personales (diario, objetivo, compra) en localStorage, y en la nube si hay cuenta.' },
      { f: 'app.js.txt', nombre: 'app.js', lang: 'js', desde: 1, repo: 'js/app.js',
        nota: 'El punto de entrada: arranca cada módulo en orden.' }
    ] }
  ];
  var LETRAS = { c: 'Crear · POST', r: 'Leer · GET', u: 'Actualizar · PUT', d: 'Borrar · DELETE' }; // texto de cada etiqueta CRUD

  var estado = { grupo: 0, archivo: 0, comentarios: true, crud: '' };     // lo elegido ahora mismo (crud '' = ninguna etiqueta)
  var cache = {};                                                         // textos ya pedidos, para no repetir la petición

  // ---- PEQUEÑAS AYUDAS ----
  function esc(t) { return t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); } // evita que el código se interprete como HTML
  function span(clase, t) { return '<span class="' + clase + '">' + esc(t) + '</span>'; }           // un trozo de texto con su color

  var PALABRAS = /^(?:import|export|from|const|let|var|function|async|await|return|if|else|try|catch|throw|new|for|of|in|continue|true|false|null|undefined|typeof|class|default)$/; // palabras clave de JavaScript

  // ---- COLOREAR: parte una línea en trozos (comentario, texto, palabra clave...) ----
  // st guarda si venimos de dentro de un comentario de varias líneas (st.bloque)
  function partir(linea, lang, st) {
    var out = [], i = 0, n = linea.length;                                // out = trozos; i = posición actual
    while (i < n) {
      if (st.bloque) {                                                    // estamos dentro de un comentario de varias líneas
        var fin = linea.indexOf(lang === 'html' ? '-->' : '*/', i);       // ¿en esta línea se cierra?
        var largo = lang === 'html' ? 3 : 2;                              // longitud del cierre
        if (fin === -1) { out.push(['c', linea.slice(i)]); i = n; }       // no se cierra: toda la línea es comentario
        else { out.push(['c', linea.slice(i, fin + largo)]); i = fin + largo; st.bloque = false; } // se cierra aquí
        continue;
      }
      var resto = linea.slice(i);                                         // lo que queda por mirar
      if (lang === 'html') {
        if (resto.indexOf('<!--') === 0) { st.bloque = true; out.push(['c', '<!--']); i += 4; continue; } // empieza un comentario HTML
        var m = /^<\/?[A-Za-z!][^\s>\/]*/.exec(resto);                    // el principio de una etiqueta: <div, </div, <!DOCTYPE
        if (m) { out.push(['t', m[0]]); i += m[0].length; continue; }
        m = /^[\w:-]+(?==)/.exec(resto);                                  // un atributo: class= , id=
        if (m) { out.push(['a', m[0]]); i += m[0].length; continue; }
        m = /^"[^"]*"?|^'[^']*'?/.exec(resto);                            // un texto entre comillas
        if (m) { out.push(['s', m[0]]); i += m[0].length; continue; }
        out.push(['', resto[0]]); i += 1; continue;                       // cualquier otro carácter, sin color
      }
      if (resto.indexOf('/*') === 0) { st.bloque = true; out.push(['c', '/*']); i += 2; continue; } // empieza un comentario /* */
      if (lang === 'js' && resto.indexOf('//') === 0) { out.push(['c', resto]); i = n; continue; }  // comentario de línea: hasta el final
      var q = resto[0];                                                   // primer carácter
      if (q === '"' || q === "'" || q === '`') {                          // empieza un texto
        var j = i + 1;                                                    // buscamos la comilla que lo cierra
        while (j < n && linea[j] !== q) { if (linea[j] === '\\') j++; j++; }
        out.push(['s', linea.slice(i, j + 1)]); i = j + 1; continue;
      }
      var w = /^[A-Za-z_$][\w$-]*/.exec(resto);                           // una palabra
      if (w) {
        var esProp = lang === 'css' && /^\s*:/.test(resto.slice(w[0].length)) && /^\s*$/.test(linea.slice(0, i)); // en CSS: nombre de propiedad al principio de línea
        out.push([esProp ? 'a' : (lang === 'js' && PALABRAS.test(w[0]) ? 'k' : ''), w[0]]); i += w[0].length; continue;
      }
      w = /^#[0-9a-fA-F]{3,8}\b|^\d[\d.]*/.exec(resto);                   // un número o un color #RRGGBB
      if (w) { out.push(['n', w[0]]); i += w[0].length; continue; }
      out.push(['', q]); i += 1;                                          // otro carácter
    }
    return out;
  }

  // ---- DIBUJAR EL CÓDIGO ----
  function pintar(a, texto) {
    var lineas = texto.replace(/\s+$/, '').split('\n');                   // el texto en líneas (sin saltos finales)
    var st = { bloque: false }, html = '';                                // st = estado del coloreado; html = resultado
    var rangos = a.crud || [];                                            // rangos CRUD de este archivo
    lineas.forEach(function (linea, k) {
      var num = a.desde + k;                                              // número de línea en el archivo original
      var tokens = partir(linea, a.lang, st);                             // la línea en trozos de color
      var tieneComentario = tokens.some(function (t) { return t[0] === 'c'; }); // ¿lleva algún comentario?
      if (!estado.comentarios) {                                          // modo "Solo código": se quitan los comentarios
        tokens = tokens.filter(function (t) { return t[0] !== 'c'; });
        var limpio = tokens.map(function (t) { return t[1]; }).join('').replace(/\s+$/, '');
        if (tieneComentario && limpio.trim() === '') return;              // si la línea era solo comentario, se salta entera
        tokens = partir(limpio, a.lang, { bloque: false });               // se vuelve a colorear sin los comentarios
      }
      var letra = '';                                                     // qué operación CRUD toca esta línea ('' = ninguna)
      rangos.forEach(function (r) { if (num >= r[0] && num <= r[1]) letra = r[2]; });
      var clase = 'cv-l' + (letra ? ' cv-op-' + letra : '') +                // clases: línea, color de su operación...
        (estado.crud && letra !== estado.crud ? ' cv-apagada' : '') +     // ...y apagada si hay otra etiqueta elegida
        (estado.crud && letra === estado.crud ? ' cv-activa' : '');       // ...o resaltada si es la elegida
      html += '<span class="' + clase + '" data-n="' + num + '">' +
        (tokens.map(function (t) { return t[0] ? span('cv-' + t[0], t[1]) : esc(t[1]); }).join('') || ' ') + '</span>';
    });
    return html;
  }

  // ---- DIBUJAR TODO EL VISOR ----
  function dibujar() {
    var g = GRUPOS[estado.grupo], a = g.archivos[estado.archivo];         // el grupo y el archivo elegidos
    var tabs = GRUPOS.map(function (x, i) {                               // pestañas HTML / CSS / JavaScript
      return '<button type="button" role="tab" class="cv-tab" data-grupo="' + i + '" aria-selected="' + (i === estado.grupo) + '">' + x.nombre + '</button>';
    }).join('');
    var archivos = g.archivos.length > 1 ? '<div class="cv-archivos" role="group" aria-label="Archivo">' + g.archivos.map(function (x, i) { // un botón por archivo (solo si hay varios)
      return '<button type="button" class="cv-archivo" data-archivo="' + i + '" aria-pressed="' + (i === estado.archivo) + '">' + x.nombre + (x.crud ? ' <i>CRUD</i>' : '') + '</button>';
    }).join('') + '</div>' : '';
    var crud = a.crud ? '<div class="cv-crud" role="group" aria-label="Operaciones del CRUD">' +
      ['c', 'r', 'u', 'd'].filter(function (l) { return a.crud.some(function (r) { return r[2] === l; }); }).map(function (l) { // solo las letras que existen en este archivo
        return '<button type="button" class="cv-chip cv-chip-' + l + '" data-crud="' + l + '" aria-pressed="' + (estado.crud === l) + '"><b>' + l.toUpperCase() + '</b> ' + LETRAS[l] + '</button>';
      }).join('') + '</div>' : '';
    raiz.innerHTML =
      '<div class="cv-barra"><div class="cv-tabs" role="tablist">' + tabs + '</div>' +
        '<div class="cv-acciones"><label class="cv-interruptor"><input type="checkbox" id="cvComentarios"' + (estado.comentarios ? ' checked' : '') + '><span class="cv-pista"></span>Comentarios</label>' +
        '<button type="button" class="cv-copiar" id="cvCopiar">Copiar</button></div></div>' +
      archivos + crud +
      '<div class="cv-caja"><pre class="cv-pre" tabindex="0" role="region" aria-label="Código de ' + esc(a.nombre) + '"><code id="cvCodigo">Cargando…</code></pre></div>' +
      '<p class="cv-pie"><span>' + esc(a.nota) + '</span> <a href="' + GITHUB + a.repo + '" target="_blank" rel="noopener noreferrer">Ver ' + esc(a.nombre) + ' completo en GitHub ↗</a></p>';
    cargar(a);                                                            // pedir el texto del archivo y pintarlo
  }

  // Pide el archivo (solo la primera vez) y lo pinta
  function cargar(a) {
    var hueco = document.getElementById('cvCodigo');                      // donde va el código
    function mostrar(texto) {                                             // pinta el texto y, si hay etiqueta CRUD, baja a su primera línea
      hueco.innerHTML = pintar(a, texto);
      if (estado.crud) {                                                    // con una etiqueta elegida, bajamos a su primera línea
        var l = hueco.querySelector('.cv-activa'), caja = hueco.closest('.cv-caja');   // la primera línea resaltada y la caja con scroll
        if (l && caja) caja.scrollTop += l.getBoundingClientRect().top - caja.getBoundingClientRect().top - 40; // la subimos hasta arriba (con un margen de 40 px)
      }
    }
    if (cache[a.f] !== undefined) { mostrar(cache[a.f]); return; }        // ya lo teníamos
    fetch(CARPETA + a.f).then(function (r) { if (!r.ok) throw new Error(r.status); return r.text(); }).then(function (t) { // si no, se pide
      cache[a.f] = t; mostrar(t);
    }).catch(function () {                                                // si falla, mensaje y enlace al repositorio
      hueco.textContent = 'No se pudo cargar el código. Puedes verlo en GitHub.';
    });
  }

  // ---- LOS CLICS (un solo oyente para todo el visor) ----
  raiz.addEventListener('click', function (e) {
    var b = e.target.closest('button');                                   // el botón pulsado
    if (!b) return;
    if (b.hasAttribute('data-grupo')) { estado.grupo = +b.getAttribute('data-grupo'); estado.archivo = 0; estado.crud = ''; dibujar(); }   // cambia de pestaña
    else if (b.hasAttribute('data-archivo')) { estado.archivo = +b.getAttribute('data-archivo'); estado.crud = ''; dibujar(); }              // cambia de archivo
    else if (b.hasAttribute('data-crud')) { var l = b.getAttribute('data-crud'); estado.crud = estado.crud === l ? '' : l; dibujar(); }     // enciende o apaga una etiqueta CRUD
    else if (b.id === 'cvCopiar') {                                       // copiar el código que se ve
      var texto = document.getElementById('cvCodigo').innerText;
      var avisar = function () { b.textContent = 'Copiado'; setTimeout(function () { b.textContent = 'Copiar'; }, 1400); };
      if (navigator.clipboard) navigator.clipboard.writeText(texto).then(avisar).catch(function () {}); else avisar();
    }
  });
  raiz.addEventListener('change', function (e) {                          // el interruptor de comentarios
    if (e.target.id === 'cvComentarios') { estado.comentarios = e.target.checked; dibujar(); }
  });

  dibujar();                                                              // primera vez: se dibuja el visor
})();
