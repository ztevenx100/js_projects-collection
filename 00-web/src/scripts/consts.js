export const PROJECTS = [
  {
    slug: "01-chatgpt-local",
    title: "ChatGPT local",
    description: "Usa IA de forma local y gratis. 100% privacidad",
    learnings: [
      "Web Workers",
      "IA",
      "ESModules"
    ],
    image: "chat-gpt",
    theme: {
      isDark: false
    },
  },
  {
    slug: "02-tetris",
    title: "Tetris en Canvas",
    description: "Prueba técnica que te propone crear el Tetris",
    learnings: [
      "Canvas",
      "Eventos de teclado",
      "Lógica de programación"
    ],
    image: "tetris",
    theme: {
      isDark: true
    },
  },
  {
    slug: "03-tier-list",
    title: "Tier Maker",
    description: "Arrastra y suelta las imágenes para crear tus propias listas de niveles",
    learnings: [
      "Drag & Drop",
      "Input de imágenes",
      "CSS Custom Properties"
    ],
    image: "tier-list",
    theme: {
      isDark: true
    },
  },
  {
    slug: "04-excel",
    title: "Excel en js",
    description: "Crea tu propio Excel sin dependencias y funcional",
    learnings: [
      "Tablas",
      "Eventos de Input: focus y blur",
      "Eval"
    ],
    image: "excel",
    theme: {
      isDark: false
    },
  },
  {
    slug: "05-paint",
    title: "Paint con Canvas",
    description: "Crea un editor de imágenes clásico con <canvas>",
    learnings: [
      "Grid Area",
      "Canvas",
      "EyeDropper API"
    ],
    image: "paint",
    theme: {
      isDark: true
    },
  },
  {
    slug: "06-stack-game",
    title: "Stack game con Canvas",
    description: "Juego donde hay que apilar las piezas verticalmente",
    learnings: [
      "Canvas",
      "Lógica de programación",
      "Eventos de teclado"
    ],
    image: "stack-game",
    theme: {
      isDark: true
    },
  },
  {
    slug: "07-lorem-generator",
    title: "Generador Lorem Ipsum",
    description: "Generador Lorem Ipsum",
    learnings: [
      "Lógica de programación",
      "método slice",
    ],
    image: "lorem-generator",
    theme: {
      isDark: false
    },
  },
  {
    slug: "08-js-perf-benchmark",
    title: "JS perf benchmark",
    description: "App para revisar el rendimiento de tu código JavaScript",
    learnings: [
      "Web Workers",
      "IA",
      "ESModules"
    ],
    image: "js-perf-benchmark",
    theme: {
      isDark: true
    },
  },
  {
    slug: "09-moto-scroll",
    title: "Animación por Scroll",
    description: "Anima el fondo de una web a través del scroll",
    learnings: [
      "Scroll",
      "Animaciones",
      "Performance"
    ],
    image: "moto-scroll",
    theme: {
      isDark: true
    },
  },
  {
    slug: "10-api-geo-ip",
    title: "Buscar info de IP",
    description: "Llama a una API para obtener información de cualquier IP y muestra la información en pantalla",
    learnings: [
      "Fetch API",
      "Formularios",
      "Asincronía"
    ],
    image: "api-geo-ip",
    theme: {
      isDark: true
    },
  },
  {
    slug: "11-weather-app",
    title: "Weather App",
    description: "Aplicación del clima que muestra el pronóstico actual con datos en tiempo real",
    learnings: [
      "Fetch API",
      "LocalStorage",
      "APIs externas"
    ],
    image: "weather-app",
    theme: {
      isDark: true
    },
  },
  {
    slug: "12-memory-game",
    title: "Memory Game",
    description: "Juego de memoria con cartas donde debes encontrar los pares coincidentes",
    learnings: [
      "Manipulación del DOM",
      "Algoritmo de Fisher-Yates",
      "CSS Grid y Flexbox"
    ],
    image: "memory-game",
    theme: {
      isDark: true
    },
  },
  {
    slug: "13-notes-app",
    title: "Notes App",
    description: "Aplicación de notas con categorías, búsqueda y almacenamiento local",
    learnings: [
      "LocalStorage",
      "Markdown",
      "Filtros y Búsqueda"
    ],
    image: "notes-app",
    theme: {
      isDark: true
    },
  },
  {
    slug: "14-password-generator",
    title: "Password Generator",
    description: "Genera contraseñas seguras y personalizadas fácilmente.",
    learnings: [
      "Manipulación del DOM",
      "Math.random()",
      "Validación de formularios"
    ],
    image: "password-generator",
    theme: {
      isDark: true
    },
  },
  {
    slug: "15-qr-generator",
    title: "QR Generator",
    description: "Genera códigos QR personalizados fácilmente.",
    learnings: [
      "Manipulación del DOM",
      "Uso de librerías externas (QRious)",
      "Descarga de imágenes"
    ],
    image: "qr-generator",
    theme: {
      isDark: true
    },
  },
  {
    slug: "16-music-player",
    title: "Music Player",
    description: "Reproductor de música simple y moderno en JavaScript.",
    learnings: [
      "Audio API",
      "Manipulación del DOM",
      "Controles multimedia"
    ],
    image: "music-player",
    theme: {
      isDark: true
    },
  },
  {
    slug: "17-calendar-app",
    title: "Calendario Interactivo",
    description: "Calendario mensual con eventos y recordatorios almacenados en localStorage.",
    learnings: [
      "Manipulación del DOM",
      "localStorage",
      "Eventos personalizados",
      "Lógica de fechas"
    ],
    image: "calendar-app",
    theme: {
      isDark: true
    },
  },
  {
    slug: "18-expense-tracker",
    title: "Gestor de Gastos Personales",
    description: "App para registrar, visualizar y eliminar tus gastos personales con suma total automática.",
    learnings: [
      "Manipulación del DOM",
      "localStorage",
      "Formularios",
      "Cálculo de totales"
    ],
    image: "expense-tracker",
    theme: {
      isDark: true
    },
  },
  {
    slug: "19-markdown-viewer",
    title: "Visor de Markdown",
    description: "Un editor y visualizador de Markdown en tiempo real.",
    learnings: [
      "DOM Manipulation",
      "Event Listeners",
      "marked.js"
    ],
    image: "markdown-viewer",
    theme: {
      isDark: true
    },
  },
  {
    slug: "20-kanban-board",
    title: "Tablero Kanban",
    description: "Tablero Kanban para gestión de tareas con funcionalidad de arrastrar y soltar",
    learnings: [
      "Drag & Drop API",
      "localStorage",
      "DOM Manipulation"
    ],
    image: "kanban-board",
    theme: {
      isDark: false
    },
  },
]