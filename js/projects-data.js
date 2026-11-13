// LISTA DE PROYECTOS de la página "Proyectos" (proyectos/index.html).
// Para añadir un proyecto nuevo basta con copiar uno de los bloques de abajo, cambiar sus datos y guardar:
// la página genera sola las tarjetas y los filtros. No hay que tocar nada más.
//
// Campos:
//   title    nombre del proyecto
//   cats     filtros en los que aparece: "branding" | "grafico" | "web" | "campanas" | "personal"
//   label    categoría que se ve en la tarjeta
//   desc     descripción breve
//   image    ruta de la imagen de portada (desde la raíz de la web)
//   alt      texto alternativo de la imagen
//   url      enlace a la página del proyecto (si es de otra web, external: true)
//   cta      texto del enlace (opcional; por defecto "Ver caso de estudio")
//   hidden   true para tenerlo preparado sin que se vea todavía
//
// El orden de esta lista es el orden en que salen en la página.
window.PROJECT_FILTERS = [
  { id: 'todos', label: 'Todos' },
  { id: 'branding', label: 'Branding e identidad' },
  { id: 'grafico', label: 'Diseño gráfico' },
  { id: 'web', label: 'Diseño web y desarrollo' },
  { id: 'campanas', label: 'Campañas y eventos' }
];

window.PROJECTS = [
  {
    title: 'Open House Madrid',
    cats: ['branding', 'grafico', 'campanas'],
    label: 'Branding, identidad y comunicación',
    desc: 'Identidad de cada edición desde 2021 y rebranding del décimo aniversario: sistema modular, campañas, señalética y web.',
    image: 'open-house-madrid/imgs/1.webp',
    alt: 'Voluntarias de Open House Madrid con la identidad del festival en tote bags y camisetas',
    url: 'open-house-madrid/'
  },
  {
    title: 'Open House Málaga',
    cats: ['branding', 'grafico', 'campanas'],
    label: 'Branding e identidad visual',
    desc: 'Identidad y sistema gráfico del festival de arquitectura, de la calle a la pantalla.',
    image: 'open-house-malaga/imgs/mupi-centro-comercial.jpg',
    alt: 'Mupi digital de Open House Málaga 2025 en un centro comercial',
    url: 'open-house-malaga/'
  },
  {
    title: 'LIV Golf Valderrama',
    cats: ['grafico', 'campanas'],
    label: 'Campañas y diseño gráfico',
    desc: 'Más de 200 adaptaciones de una misma campaña: de los banners a las vallas, los mupis y los vehículos rotulados.',
    image: 'liv-golf/img/portada-v4.jpg',
    alt: 'Portada del Diario de Cádiz con la campaña de LIV Golf Valderrama, sobre una superficie oscura',
    url: 'liv-golf/'
  },
  {
    title: 'Calcula lo tuyo',
    cats: ['web', 'personal'],
    label: 'Diseño web y desarrollo',
    desc: 'Calculadoras laborales y guías, diseñadas, desarrolladas y optimizadas desde cero.',
    image: 'calcula-lo-tuyo/img/portada-v2.jpg',
    alt: 'Calcula lo tuyo: la calculadora de finiquito en un móvil, con las etiquetas «Basado en el BOE», «100% gratis» y «Sin registro»',
    url: 'calcula-lo-tuyo/'
  },
  {
    title: 'Estrella Damm N.A. Andalucía Masters',
    cats: ['branding', 'grafico', 'campanas'],
    label: 'Identidad de evento y campañas',
    desc: 'Identidad del torneo, cartelería y soportes exteriores, con publicidad online y offline, newsletters y merchandising.',
    image: 'estrella-damm-n-a-andalucia-masters/imgs/portada-v7.jpg',
    alt: 'Jugador durante el swing en el Estrella Damm N.A. Andalucía Masters, con el público y el rótulo #EDAM al fondo',
    url: 'estrella-damm-n-a-andalucia-masters/'
  },
  {
    title: 'Escáner laboral',
    cats: ['web', 'personal'],
    label: 'Acción interactiva',
    desc: 'Acción interactiva para dinamizar la búsqueda de empleo: unas preguntas crean tu perfil y lo conectan con vacantes de Infojobs.',
    image: 'imgs/proyectos/escaner-laboral.jpg',
    alt: 'Escáner de Compatibilidad Laboral: tres pantallas del test — una pregunta, la acreditación de inicio y el informe de resultado',
    url: 'https://escaner-infojobs.netlify.app',
    external: true,
    cta: 'Ver proyecto',
    hidden: true   // oculto por ahora: quitar esta línea para volver a mostrarlo
  },
  {
    title: 'Fit Bites',
    cats: ['web', 'personal'],
    label: 'Web app · proyecto de aprendizaje',
    desc: 'Web app de diario de comidas que hice mientras aprendía el CRUD en un curso de fullstack: calorías y macros, recetas y lista de la compra.',
    image: 'imgs/proyectos/fit-bites-v2.jpg',
    alt: 'Fit Bites: tres pantallas de la app — portada, diario del día con calorías y macros, y resumen semanal',
    url: 'https://taniadeazevedo.github.io/fit-bites/',   // por ahora lleva directo a la app; la página de caso está en fit-bites/ (borrador)
    external: true,
    cta: 'Ver proyecto'
  },
  {
    title: 'Portafolio',
    cats: ['web', 'personal'],
    label: 'Diseño web y desarrollo',
    desc: 'Este portafolio, hecho a mano con HTML, CSS y JavaScript puro, sin plantillas: despliegue en GitHub Pages y proyectos por carpetas.',
    image: 'imgs/proyectos/portafolio-v2.jpg',
    alt: 'Este portafolio en un monitor: la portada con «Diseñadora de branding y experiencias digitales» y el vídeo de Robyn a la derecha',
    url: 'https://github.com/taniadeazevedo/taniadeazevedo.es',
    external: true,
    cta: 'Ver código'
  },
  {
    title: 'La Nueva Línea',
    cats: ['branding', 'grafico'],
    label: 'Identidad visual',
    desc: 'Identidad visual completa para la marca cultural y de ocio de La Línea de la Concepción.',
    image: 'la-nueva-linea/imgs/la-nueva-linea-poster.jpg',
    alt: 'La Nueva Línea',
    url: 'la-nueva-linea/',
    hidden: true   // oculto. La carpeta la-nueva-linea/ ya no está en el repositorio (copia en ~/Documents/la-nueva-linea-copia): para mostrarlo, volver a añadir la carpeta y quitar esta línea
  }
];
