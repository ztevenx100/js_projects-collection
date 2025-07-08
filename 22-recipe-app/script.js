/**
 * Aplicación de Recetas de Cocina
 * 
 * Características:
 * - Búsqueda y filtrado de recetas
 * - Guardado de recetas favoritas
 * - Visualización detallada de recetas
 * - Modo oscuro/claro
 * - Diseño responsivo
 */

// Estado de la aplicación
const state = {
  recipes: [],          // Todas las recetas disponibles
  filteredRecipes: [],  // Recetas después de aplicar filtros
  favorites: [],        // IDs de recetas favoritas
  currentPage: 1,       // Página actual en resultados
  recipesPerPage: 6,    // Número de recetas por página
  loading: false,       // Estado de carga
  activeTab: 'results', // Pestaña activa (results/favorites)
  darkMode: false       // Estado del tema
};

// Elementos DOM
const elements = {
  // Elementos principales
  searchInput: document.getElementById('recipe-search'),
  searchBtn: document.getElementById('search-btn'),
  loader: document.getElementById('loader'),
  errorContainer: document.getElementById('error-container'),
  errorMessage: document.getElementById('error-message'),
  
  // Filtros
  cuisineFilter: document.getElementById('cuisine-filter'),
  dietFilter: document.getElementById('diet-filter'),
  timeFilter: document.getElementById('time-filter'),
  
  // Pestañas y contenido
  tabBtns: document.querySelectorAll('.tab-btn'),
  tabContents: document.querySelectorAll('.tab-content'),
  resultsContainer: document.getElementById('recipes-results'),
  favoritesContainer: document.getElementById('recipes-favorites'),
  noFavorites: document.getElementById('no-favorites'),
  resultsPagination: document.getElementById('results-pagination'),
  
  // Modal
  recipeModal: document.getElementById('recipe-modal'),
  recipeDetail: document.getElementById('recipe-detail'),
  closeModal: document.querySelector('.close-modal'),
  
  // Tema
  themeToggle: document.getElementById('theme-toggle')
};

// =========================================================
// Inicialización de la aplicación
// =========================================================
function init() {
  loadFavorites();
  loadUserPreferences();
  fetchRecipes();
  setupEventListeners();
}

// Cargar favoritos desde localStorage
function loadFavorites() {
  const savedFavorites = localStorage.getItem('recipeAppFavorites');
  if (savedFavorites) {
    state.favorites = JSON.parse(savedFavorites);
  }
}

// Cargar preferencias de usuario (tema)
function loadUserPreferences() {
  const savedTheme = localStorage.getItem('recipeAppTheme');
  if (savedTheme === 'dark') {
    state.darkMode = true;
    elements.themeToggle.checked = true;
    document.body.classList.add('dark-theme');
  }
}

// Configurar todos los event listeners
function setupEventListeners() {
  // Búsqueda y filtros
  elements.searchBtn.addEventListener('click', handleSearch);
  elements.searchInput.addEventListener('keyup', e => {
    if (e.key === 'Enter') handleSearch();
  });
  
  elements.cuisineFilter.addEventListener('change', applyFilters);
  elements.dietFilter.addEventListener('change', applyFilters);
  elements.timeFilter.addEventListener('change', applyFilters);
  
  // Tabs
  elements.tabBtns.forEach(btn => {
    btn.addEventListener('click', () => switchTab(btn.dataset.tab));
  });
  
  // Modal
  elements.closeModal.addEventListener('click', closeModal);
  window.addEventListener('click', e => {
    if (e.target === elements.recipeModal) closeModal();
  });
  
  // Tema
  elements.themeToggle.addEventListener('change', toggleTheme);
}

// Cambiar entre tema claro y oscuro
function toggleTheme() {
  if (elements.themeToggle.checked) {
    document.body.classList.add('dark-theme');
    localStorage.setItem('recipeAppTheme', 'dark');
    state.darkMode = true;
  } else {
    document.body.classList.remove('dark-theme');
    localStorage.setItem('recipeAppTheme', 'light');
    state.darkMode = false;
  }
}

// =========================================================
// Gestión de datos y API
// =========================================================

// Obtener recetas (desde una API o datos simulados)
async function fetchRecipes() {
  try {
    showLoader();
    
    // En producción, aquí se haría una llamada a una API real
    // const response = await fetch('https://api.example.com/recipes');
    // const data = await response.json();
    
    // Para desarrollo, usamos datos simulados
    const data = getMockRecipes();
    
    state.recipes = data;
    state.filteredRecipes = [...data];
    
    renderRecipes();
    hideLoader();
    
  } catch (error) {
    console.error('Error fetching recipes:', error);
    showError('No se pudieron cargar las recetas. Intenta nuevamente más tarde.');
    hideLoader();
  }
}

// Datos simulados para desarrollo
function getMockRecipes() {
  return [
    {
      id: 1,
      title: 'Pasta Carbonara',
      image: 'https://images.unsplash.com/photo-1588013273468-315fd88ea34c?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80',
      cuisine: 'italian',
      diet: [''],
      prepTime: 20,
      cookTime: 15,
      servings: 4,
      tags: ['pasta', 'italian', 'quick'],
      description: 'Una clásica pasta italiana con salsa cremosa de huevo, queso, panceta y pimienta negra. Lista en 35 minutos.',
      ingredients: [
        '350g de espaguetis',
        '150g de panceta',
        '3 huevos grandes',
        '75g de queso pecorino romano rallado',
        '50g de queso parmesano rallado',
        'Pimienta negra molida',
        'Sal'
      ],
      instructions: [
        'Cocina la pasta en abundante agua con sal siguiendo las instrucciones del paquete.',
        'Mientras tanto, corta la panceta en trozos pequeños y cocínala en una sartén grande a fuego medio hasta que esté crujiente.',
        'En un bowl, mezcla los huevos, el queso pecorino, el queso parmesano y bastante pimienta negra molida.',
        'Cuando la pasta esté lista, reserva una taza del agua de cocción y escurre la pasta.',
        'Agrega inmediatamente la pasta a la sartén con la panceta, remueve del fuego.',
        'Añade la mezcla de huevo y queso, revolviendo rápidamente. Si es necesario, agrega un poco del agua de cocción reservada para conseguir una salsa cremosa.',
        'Sirve inmediatamente con más queso parmesano y pimienta negra por encima.'
      ]
    },
    {
      id: 2,
      title: 'Tacos de Carnitas',
      image: 'https://images.unsplash.com/photo-1552332386-f8dd00dc2f85?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80',
      cuisine: 'mexican',
      diet: [''],
      prepTime: 30,
      cookTime: 180,
      servings: 6,
      tags: ['mexican', 'pork', 'tacos'],
      description: 'Deliciosos tacos mexicanos con carne de cerdo cocida lentamente hasta que esté tierna y jugosa.',
      ingredients: [
        '1.5kg de paleta o falda de cerdo',
        '1 naranja, cortada por la mitad',
        '3 dientes de ajo',
        '1 cebolla, cortada en cuartos',
        '2 hojas de laurel',
        '2 cdtas de comino molido',
        '1 cdta de orégano seco',
        'Sal y pimienta',
        'Tortillas de maíz',
        'Cilantro picado, para servir',
        'Cebolla picada, para servir',
        'Limones, para servir'
      ],
      instructions: [
        'Corta la carne en trozos grandes. Sazona generosamente con sal, pimienta, comino y orégano.',
        'Calienta un poco de aceite en una olla grande a fuego medio-alto. Dora la carne por todos lados.',
        'Añade la cebolla, el ajo, las hojas de laurel y exprime la naranja sobre la carne. Agrega las cáscaras de naranja también.',
        'Agrega suficiente agua para cubrir ligeramente la carne. Lleva a ebullición, luego reduce a fuego lento.',
        'Cocina cubierto durante unas 3 horas, o hasta que la carne se deshaga fácilmente con un tenedor.',
        'Precalienta el horno a 220°C. Desmenuzca la carne con dos tenedores.',
        'Coloca la carne desmenuzada en una bandeja para hornear y hornea durante unos 15-20 minutos, hasta que los bordes estén crujientes.',
        'Sirve la carne en tortillas de maíz calientes, con cilantro fresco, cebolla picada y limón.'
      ]
    },
    {
      id: 3,
      title: 'Ensalada César Vegana',
      image: 'https://images.unsplash.com/photo-1550304943-4f24f54ddde9?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80',
      cuisine: 'american',
      diet: ['vegan'],
      prepTime: 15,
      cookTime: 10,
      servings: 2,
      tags: ['vegan', 'salad', 'healthy'],
      description: 'Una versión vegana de la clásica ensalada César, sin perder su cremosidad y sabor.',
      ingredients: [
        '1 lechuga romana grande',
        '1 taza de garbanzos cocidos',
        '2 rebanadas de pan integral',
        '3 cdas de aceite de oliva',
        '1/2 cdta de ajo en polvo',
        'Para el aderezo:',
        '1/2 taza de anacardos remojados por 4 horas',
        '2 cdas de jugo de limón',
        '1 cdta de mostaza Dijon',
        '1 diente de ajo pequeño',
        '2 cdas de levadura nutricional',
        '1/4 taza de agua',
        'Sal y pimienta al gusto'
      ],
      instructions: [
        'Precalienta el horno a 180°C. Corta el pan en cubos pequeños y mézclalos con 1 cda de aceite de oliva y el ajo en polvo. Hornea durante 10 minutos hasta que estén crujientes.',
        'Escurre y seca los garbanzos. Mézclalos con 1 cda de aceite de oliva y sal. Hornéalos junto con el pan durante 10 minutos.',
        'Para el aderezo, combina todos los ingredientes en una licuadora y procesa hasta obtener una mezcla suave. Si está muy espeso, agrega más agua.',
        'Lava y seca la lechuga, córtala en trozos y colócala en un bowl grande.',
        'Agrega los crutones y los garbanzos horneados.',
        'Vierte el aderezo sobre la ensalada y mezcla bien. Sirve inmediatamente.'
      ]
    },
    {
      id: 4,
      title: 'Pad Thai',
      image: 'https://images.unsplash.com/photo-1567982047351-76b6f93e9073?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80',
      cuisine: 'asian',
      diet: [''],
      prepTime: 15,
      cookTime: 15,
      servings: 4,
      tags: ['asian', 'noodles', 'thai'],
      description: 'Un plato tailandés clásico con fideos de arroz, vegetales crujientes, huevo y cacahuetes.',
      ingredients: [
        '200g de fideos de arroz',
        '200g de tofu firme (opcional)',
        '2 huevos',
        '100g de brotes de soja',
        '3 cebolletas',
        '2 dientes de ajo picados',
        '50g de cacahuetes tostados',
        'Cilantro fresco',
        'Limones',
        'Para la salsa:',
        '3 cdas de salsa de pescado (o salsa de soja para versión vegetariana)',
        '2 cdas de azúcar moreno',
        '2 cdas de salsa de tamarindo',
        '1 cdta de pasta de chile (opcional)'
      ],
      instructions: [
        'Remoja los fideos de arroz en agua caliente durante 10 minutos hasta que estén suaves pero firmes. Escurre y reserva.',
        'En un bowl pequeño, mezcla todos los ingredientes de la salsa.',
        'Calienta un wok o sartén grande. Si usas tofu, córtalo en cubos y dóralo primero, luego reserva.',
        'Agrega un poco de aceite al wok y revuelve los ajos picados brevemente.',
        'Añade los huevos batidos y revuelve hasta que estén casi cuajados.',
        'Incorpora los fideos remojados y la salsa. Revuelve constantemente para que los fideos absorban la salsa.',
        'Agrega los brotes de soja, las cebolletas cortadas y el tofu si lo estás usando. Cocina por 1-2 minutos más.',
        'Sirve caliente, espolvoreado con cacahuetes triturados, cilantro fresco y acompañado de gajos de limón.'
      ]
    },
    {
      id: 5,
      title: 'Hummus Casero',
      image: 'https://images.unsplash.com/photo-1643456211211-7d685d5f1507?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80',
      cuisine: 'mediterranean',
      diet: ['vegan', 'gluten-free'],
      prepTime: 10,
      cookTime: 0,
      servings: 6,
      tags: ['vegan', 'appetizer', 'dip', 'healthy'],
      description: 'Cremoso hummus casero con garbanzos, tahini, limón y aceite de oliva. Perfecto como aperitivo o snack.',
      ingredients: [
        '400g de garbanzos cocidos',
        '60ml de tahini',
        'Jugo de 1 limón grande',
        '2 dientes de ajo',
        '3 cdas de aceite de oliva extra virgen',
        '1/2 cdta de comino molido',
        'Sal al gusto',
        'Pimentón ahumado para decorar',
        'Aceite de oliva extra para servir'
      ],
      instructions: [
        'Escurre y enjuaga los garbanzos. Para un hummus más suave, puedes pelar los garbanzos frotándolos suavemente entre tus dedos.',
        'En un procesador de alimentos, coloca el ajo y procesa hasta que esté picado finamente.',
        'Agrega los garbanzos, el tahini, el jugo de limón, el comino y la sal. Procesa hasta obtener una pasta.',
        'Con el procesador encendido, agrega lentamente el aceite de oliva hasta conseguir la consistencia deseada. Si es necesario, añade un poco de agua fría.',
        'Ajusta el sabor con más sal, limón o comino según tu preferencia.',
        'Sirve en un plato hondo, creando un remolino con el reverso de una cuchara. Espolvorea con pimentón y un chorrito generoso de aceite de oliva de buena calidad.',
        'Acompaña con pan de pita, vegetales crudos o como prefieras.'
      ]
    },
    {
      id: 6,
      title: 'Hamburguesas de Frijol Negro',
      image: 'https://images.unsplash.com/photo-1565192259022-0427b058f372?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80',
      cuisine: 'american',
      diet: ['vegetarian'],
      prepTime: 20,
      cookTime: 10,
      servings: 4,
      tags: ['vegetarian', 'burger', 'beans'],
      description: 'Deliciosas hamburguesas vegetarianas hechas con frijoles negros, especias y vegetales.',
      ingredients: [
        '400g de frijoles negros cocidos',
        '1 cebolla pequeña, finamente picada',
        '2 dientes de ajo, picados',
        '1/2 pimiento rojo, picado',
        '1 zanahoria rallada',
        '2 cdas de cilantro fresco picado',
        '1 huevo (o sustituto de huevo para versión vegana)',
        '50g de pan rallado',
        '1 cdta de comino molido',
        '1 cdta de pimentón',
        'Sal y pimienta al gusto',
        '4 panes de hamburguesa',
        'Toppings a elección: lechuga, tomate, aguacate, etc.'
      ],
      instructions: [
        'Escurre y enjuaga los frijoles negros. En un bowl grande, aplástalos con un tenedor dejando algunos enteros para textura.',
        'En una sartén, saltea la cebolla, el ajo y el pimiento hasta que estén suaves, unos 5 minutos. Agrega a los frijoles.',
        'Añade la zanahoria rallada, el cilantro, las especias, el huevo y el pan rallado a la mezcla de frijoles. Mezcla bien hasta incorporar todo.',
        'Forma 4 hamburguesas con las manos ligeramente humedecidas.',
        'Calienta un poco de aceite en una sartén a fuego medio-alto. Cocina las hamburguesas por 4-5 minutos de cada lado hasta que estén doradas y firmes.',
        'Alternativamente, puedes hornearlas a 190°C por 20 minutos, volteándolas a la mitad del tiempo.',
        'Sirve en panes de hamburguesa con tus toppings favoritos.'
      ]
    },
    {
      id: 7,
      title: 'Salmón al Horno con Limón y Hierbas',
      image: 'https://images.unsplash.com/photo-1559847844-5315695dadae?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80',
      cuisine: 'mediterranean',
      diet: ['low-carb'],
      prepTime: 10,
      cookTime: 20,
      servings: 2,
      tags: ['seafood', 'healthy', 'quick'],
      description: 'Filetes de salmón jugosos horneados con limón fresco, ajo y hierbas aromáticas.',
      ingredients: [
        '2 filetes de salmón (150g cada uno)',
        '1 limón',
        '2 dientes de ajo picados',
        '2 cdas de aceite de oliva',
        '1 cda de eneldo fresco picado',
        '1 cda de perejil fresco picado',
        'Sal y pimienta negra recién molida',
        'Opcional: rodajas de limón adicionales para servir'
      ],
      instructions: [
        'Precalienta el horno a 200°C. Forra una bandeja para hornear con papel aluminio o papel de hornear.',
        'Coloca los filetes de salmón en la bandeja preparada, con la piel hacia abajo si la tienen.',
        'En un bowl pequeño, mezcla el jugo de medio limón, la ralladura de limón, el ajo picado, el aceite de oliva, el eneldo y el perejil.',
        'Vierte esta mezcla sobre los filetes de salmón, asegurándote de cubrirlos bien.',
        'Sazona con sal y pimienta al gusto. Coloca rodajas finas del limón restante sobre los filetes.',
        'Hornea durante 15-20 minutos, dependiendo del grosor de los filetes, hasta que el salmón se desmenuce fácilmente con un tenedor.',
        'Sirve inmediatamente, con rodajas adicionales de limón si lo deseas.'
      ]
    },
    {
      id: 8,
      title: 'Curry de Garbanzos',
      image: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80',
      cuisine: 'asian',
      diet: ['vegan', 'gluten-free'],
      prepTime: 15,
      cookTime: 25,
      servings: 4,
      tags: ['curry', 'vegan', 'spicy'],
      description: 'Un curry aromático y reconfortante con garbanzos, tomates y especias.',
      ingredients: [
        '2 latas de garbanzos (800g en total), escurridos y enjuagados',
        '1 cebolla grande, picada',
        '3 dientes de ajo, picados',
        '1 trozo de jengibre fresco (2cm), rallado',
        '2 cdas de aceite de oliva o ghee',
        '2 cdtas de curry en polvo',
        '1 cdta de comino molido',
        '1 cdta de cúrcuma',
        '1/2 cdta de chile en polvo (opcional, según preferencia de picante)',
        '400g de tomates troceados en lata',
        '200ml de leche de coco',
        '200ml de caldo de verduras',
        'Cilantro fresco picado, para servir',
        'Arroz basmati o pan naan, para acompañar'
      ],
      instructions: [
        'En una olla grande, calienta el aceite a fuego medio. Añade la cebolla y cocina hasta que esté suave y transparente, unos 5 minutos.',
        'Agrega el ajo y el jengibre, cocina por un minuto más hasta que suelten su aroma.',
        'Incorpora las especias: curry en polvo, comino, cúrcuma y chile en polvo. Cocina por 30 segundos, revolviendo constantemente.',
        'Añade los tomates troceados y cocina por unos 5 minutos hasta que la salsa comience a espesar.',
        'Agrega los garbanzos, la leche de coco y el caldo de verduras. Lleva a ebullición, luego reduce el fuego y deja cocinar a fuego lento durante 15-20 minutos.',
        'Prueba y ajusta la sazón con sal y pimienta.',
        'Sirve caliente, espolvoreado con cilantro fresco picado y acompañado de arroz basmati o pan naan.'
      ]
    },
    {
      id: 9,
      title: 'Pizza de Masa Integral',
      image: 'https://images.unsplash.com/photo-1589045365916-65f5c8f13703?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80',
      cuisine: 'italian',
      diet: ['vegetarian'],
      prepTime: 30,
      cookTime: 15,
      servings: 4,
      tags: ['pizza', 'vegetarian', 'homemade'],
      description: 'Pizza casera con masa integral, salsa de tomate fresca y toppings saludables.',
      ingredients: [
        'Para la masa:',
        '300g de harina integral',
        '200g de harina de trigo común',
        '7g de levadura seca',
        '1 cdta de sal',
        '1 cdta de azúcar',
        '2 cdas de aceite de oliva',
        '300ml de agua tibia',
        'Para la salsa:',
        '400g de tomates pelados en lata',
        '2 dientes de ajo picados',
        '1 cda de aceite de oliva',
        '1 cdta de orégano seco',
        'Sal y pimienta al gusto',
        'Toppings sugeridos:',
        'Mozzarella rallada',
        'Champiñones en rodajas',
        'Pimientos en tiras',
        'Cebolla roja en rodajas',
        'Aceitunas negras',
        'Albahaca fresca'
      ],
      instructions: [
        'Para la masa: En un bowl grande, mezcla las harinas, la levadura, la sal y el azúcar.',
        'Haz un hueco en el centro y añade el aceite de oliva y el agua tibia. Mezcla hasta formar una masa homogénea.',
        'Amasa sobre una superficie enharinada durante 8-10 minutos hasta que la masa esté elástica y suave.',
        'Coloca la masa en un bowl ligeramente aceitado, cubre con un paño húmedo y deja levar en un lugar cálido por 1 hora o hasta que duplique su tamaño.',
        'Para la salsa: En una cacerola, calienta el aceite y saltea el ajo por 1 minuto. Añade los tomates pelados, aplastándolos con una cuchara de madera. Agrega el orégano, sal y pimienta. Cocina a fuego lento por 15-20 minutos hasta que espese.',
        'Precalienta el horno a 240°C (o lo más caliente posible).',
        'Divide la masa en 2-3 partes. Estira cada porción sobre una superficie enharinada hasta obtener el grosor deseado.',
        'Transfiere la masa a una bandeja para hornear. Cubre con la salsa de tomate y tus toppings preferidos.',
        'Hornea por 12-15 minutos hasta que los bordes estén dorados y el queso burbujeante.',
        'Sirve caliente, opcionalmente decorado con hojas de albahaca fresca.'
      ]
    },
    {
      id: 10,
      title: 'Gachas de Avena con Frutas',
      image: 'https://images.unsplash.com/photo-1505576399279-565b52d4ac71?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80',
      cuisine: 'american',
      diet: ['vegetarian', 'gluten-free'],
      prepTime: 5,
      cookTime: 10,
      servings: 2,
      tags: ['breakfast', 'healthy', 'quick'],
      description: 'Un desayuno nutritivo y reconfortante con avena, frutas frescas y frutos secos.',
      ingredients: [
        '1 taza de avena (sin gluten certificada si se requiere)',
        '2 tazas de leche (o bebida vegetal para versión vegana)',
        '1 plátano maduro',
        '1 manzana',
        '2 cdas de miel o jarabe de arce',
        '1/2 cdta de canela',
        '1 pizca de sal',
        'Toppings:',
        'Frutos rojos frescos',
        'Nueces o almendras picadas',
        'Semillas de chía',
        'Mantequilla de maní o almendras'
      ],
      instructions: [
        'En una cacerola mediana, combina la avena, la leche y una pizca de sal. Lleva a ebullición a fuego medio-alto.',
        'Reduce el fuego a medio-bajo y cocina por 5-8 minutos, revolviendo ocasionalmente hasta que la avena esté tierna y haya alcanzado la consistencia deseada.',
        'Mientras tanto, pela y corta el plátano en rodajas. Lava, descorazona y pica la manzana.',
        'Cuando la avena esté lista, retira del fuego y agrega la canela y la miel o jarabe de arce. Mezcla bien.',
        'Sirve la avena caliente en bowls. Añade las frutas picadas y los toppings de tu elección.',
        'Para una variante más rápida, puedes preparar la avena la noche anterior: mezcla la avena con la leche, añade los demás ingredientes excepto los toppings y refrigera toda la noche.'
      ]
    },
    {
      id: 11,
      title: 'Brownies Sin Gluten',
      image: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80',
      cuisine: 'american',
      diet: ['gluten-free'],
      prepTime: 15,
      cookTime: 30,
      servings: 16,
      tags: ['dessert', 'chocolate', 'gluten-free'],
      description: 'Deliciosos brownies sin gluten, húmedos por dentro y crujientes por fuera.',
      ingredients: [
        '200g de chocolate negro (70% cacao)',
        '170g de mantequilla sin sal',
        '250g de azúcar',
        '4 huevos grandes',
        '1 cdta de extracto de vainilla',
        '100g de harina de almendras',
        '50g de cacao en polvo sin azúcar',
        '1/2 cdta de sal',
        '100g de nueces picadas (opcional)',
        '100g de chips de chocolate (opcional)'
      ],
      instructions: [
        'Precalienta el horno a 180°C. Forra un molde cuadrado de 20x20cm con papel de hornear.',
        'Derrite el chocolate y la mantequilla juntos en un bowl a baño maría o en el microondas en intervalos cortos, revolviendo con frecuencia. Deja enfriar ligeramente.',
        'En un bowl grande, bate los huevos con el azúcar hasta que estén pálidos y espumosos.',
        'Añade la mezcla de chocolate derretido y la vainilla, y bate hasta incorporar.',
        'Tamiza la harina de almendras, el cacao en polvo y la sal sobre la mezcla húmeda. Mezcla suavemente hasta que no queden rastros de ingredientes secos.',
        'Si lo deseas, añade las nueces picadas y/o los chips de chocolate y mezcla brevemente.',
        'Vierte la mezcla en el molde preparado y alisa la superficie.',
        'Hornea por 25-30 minutos, o hasta que un palillo insertado en el centro salga con unas pocas migas húmedas adheridas (no completamente limpio, eso indicaría que están demasiado cocidos).',
        'Deja enfriar completamente en el molde antes de cortar en cuadrados. Para cortes más limpios, refrigera por 1 hora antes de cortar.'
      ]
    },
    {
      id: 12,
      title: 'Smoothie Verde Detox',
      image: 'https://images.unsplash.com/photo-1610970881699-44a5587cabec?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80',
      cuisine: 'american',
      diet: ['vegan', 'gluten-free'],
      prepTime: 10,
      cookTime: 0,
      servings: 2,
      tags: ['smoothie', 'breakfast', 'healthy', 'detox'],
      description: 'Un smoothie refrescante y nutritivo lleno de vegetales verdes, frutas y superalimentos.',
      ingredients: [
        '2 tazas de espinacas frescas',
        '1/2 pepino mediano',
        '1 tallo de apio',
        '1/2 manzana verde',
        '1/2 plátano congelado',
        'Jugo de 1/2 limón',
        '1 cdta de jengibre fresco rallado',
        '1 cda de semillas de chía',
        '1 cda de mantequilla de almendras',
        '1 taza de agua de coco o agua filtrada',
        'Cubitos de hielo (opcional)'
      ],
      instructions: [
        'Lava bien todos los vegetales y frutas. Pela el pepino si no es orgánico.',
        'Corta el pepino, el apio y la manzana en trozos medianos.',
        'Coloca todos los ingredientes en el vaso de una licuadora potente, comenzando con los líquidos en el fondo.',
        'Licúa a velocidad alta durante 1-2 minutos, hasta obtener una mezcla suave y homogénea.',
        'Prueba y ajusta según tu preferencia: más agua si lo deseas más líquido, más plátano para mayor dulzor.',
        'Sirve inmediatamente para aprovechar al máximo sus nutrientes.',
        'Para un smoothie más fresco, añade cubitos de hielo antes de licuar.'
      ]
    }
  ];
}

// =========================================================
// Búsqueda y Filtros
// =========================================================

// Manejar la búsqueda de recetas
function handleSearch() {
  const searchTerm = elements.searchInput.value.toLowerCase().trim();
  
  if (!searchTerm && !hasActiveFilters()) {
    // Si no hay término de búsqueda ni filtros, mostrar todas las recetas
    state.filteredRecipes = [...state.recipes];
  } else {
    // Filtrar las recetas según el término de búsqueda y los filtros
    state.filteredRecipes = state.recipes.filter(recipe => {
      // Búsqueda por texto
      const matchesSearch = searchTerm ? 
        (recipe.title.toLowerCase().includes(searchTerm) || 
        recipe.description.toLowerCase().includes(searchTerm) ||
        recipe.tags.some(tag => tag.toLowerCase().includes(searchTerm))) :
        true;
        
      // Filtro por cocina
      const cuisine = elements.cuisineFilter.value;
      const matchesCuisine = cuisine ? recipe.cuisine === cuisine : true;
      
      // Filtro por dieta
      const diet = elements.dietFilter.value;
      const matchesDiet = diet ? recipe.diet.includes(diet) : true;
      
      // Filtro por tiempo
      const time = parseInt(elements.timeFilter.value);
      const matchesTime = time ? (recipe.prepTime + recipe.cookTime) <= time : true;
      
      // La receta debe cumplir con todos los criterios
      return matchesSearch && matchesCuisine && matchesDiet && matchesTime;
    });
  }
  
  state.currentPage = 1; // Resetear a la primera página
  renderRecipes();
  
  // Mostrar mensaje si no hay resultados
  if (state.filteredRecipes.length === 0) {
    elements.resultsContainer.innerHTML = `
      <div class="no-results">
        <p>No se encontraron recetas que coincidan con tu búsqueda.</p>
        <p>Intenta con otros términos o ajusta los filtros.</p>
      </div>
    `;
    elements.resultsPagination.innerHTML = '';
  }
}

// Aplicar filtros (cuando cambian los selectores)
function applyFilters() {
  handleSearch(); // Reutilizamos la misma lógica
}

// Verificar si hay algún filtro activo
function hasActiveFilters() {
  return elements.cuisineFilter.value !== '' || 
         elements.dietFilter.value !== '' || 
         elements.timeFilter.value !== '';
}

// =========================================================
// Renderizado de Recetas
// =========================================================

// Renderizar recetas según el estado actual
function renderRecipes() {
  if (state.activeTab === 'results') {
    renderResultsTab();
  } else {
    renderFavoritesTab();
  }
}

// Renderizar pestaña de resultados de búsqueda
function renderResultsTab() {
  // Calcular inicio y fin para paginación
  const startIndex = (state.currentPage - 1) * state.recipesPerPage;
  const endIndex = startIndex + state.recipesPerPage;
  const paginatedRecipes = state.filteredRecipes.slice(startIndex, endIndex);
  
  elements.resultsContainer.innerHTML = '';
  
  // Renderizar cada receta
  paginatedRecipes.forEach(recipe => {
    const recipeElement = createRecipeCard(recipe);
    elements.resultsContainer.appendChild(recipeElement);
  });
  
  // Renderizar controles de paginación
  renderPagination();
}

// Renderizar pestaña de favoritos
function renderFavoritesTab() {
  elements.favoritesContainer.innerHTML = '';
  
  // Obtener recetas favoritas
  const favoriteRecipes = state.recipes.filter(recipe => 
    state.favorites.includes(recipe.id)
  );
  
  // Mostrar mensaje si no hay favoritos
  if (favoriteRecipes.length === 0) {
    elements.noFavorites.classList.remove('hidden');
    return;
  }
  
  elements.noFavorites.classList.add('hidden');
  
  // Renderizar cada receta favorita
  favoriteRecipes.forEach(recipe => {
    const recipeElement = createRecipeCard(recipe);
    elements.favoritesContainer.appendChild(recipeElement);
  });
}

// Crear un elemento de tarjeta de receta
function createRecipeCard(recipe) {
  // Crear elemento contenedor
  const recipeCard = document.createElement('article');
  recipeCard.classList.add('recipe-card');
  
  // Verificar si es favorito
  const isFavorite = state.favorites.includes(recipe.id);
  
  // Crear contenido HTML de la tarjeta
  recipeCard.innerHTML = `
    <img src="${recipe.image}" alt="${recipe.title}" class="recipe-image">
    <div class="recipe-content">
      <h2 class="recipe-title">${recipe.title}</h2>
      <div class="recipe-info">
        <span>${recipe.cuisine.charAt(0).toUpperCase() + recipe.cuisine.slice(1)}</span>
        <span>${recipe.prepTime + recipe.cookTime} min</span>
      </div>
      <div class="recipe-tags">
        ${recipe.tags.slice(0, 3).map(tag => `<span class="recipe-tag">${tag}</span>`).join('')}
      </div>
      <p class="recipe-description">${recipe.description}</p>
      <div class="recipe-actions">
        <button class="view-recipe" data-id="${recipe.id}">Ver receta</button>
        <button class="favorite-btn ${isFavorite ? 'active' : ''}" data-id="${recipe.id}">
          ${isFavorite ? '★' : '☆'}
        </button>
      </div>
    </div>
  `;
  
  // Agregar event listeners
  const viewButton = recipeCard.querySelector('.view-recipe');
  viewButton.addEventListener('click', () => showRecipeDetail(recipe.id));
  
  const favoriteButton = recipeCard.querySelector('.favorite-btn');
  favoriteButton.addEventListener('click', () => toggleFavorite(recipe.id, favoriteButton));
  
  return recipeCard;
}

// Renderizar controles de paginación
function renderPagination() {
  const totalPages = Math.ceil(state.filteredRecipes.length / state.recipesPerPage);
  
  if (totalPages <= 1) {
    elements.resultsPagination.innerHTML = '';
    return;
  }
  
  let paginationHTML = '';
  
  // Botón "Anterior"
  paginationHTML += `
    <button class="page-btn prev-btn" ${state.currentPage === 1 ? 'disabled' : ''}>
      &laquo;
    </button>
  `;
  
  // Botones de páginas
  for (let i = 1; i <= totalPages; i++) {
    paginationHTML += `
      <button class="page-btn page-number ${i === state.currentPage ? 'active' : ''}" data-page="${i}">
        ${i}
      </button>
    `;
  }
  
  // Botón "Siguiente"
  paginationHTML += `
    <button class="page-btn next-btn" ${state.currentPage === totalPages ? 'disabled' : ''}>
      &raquo;
    </button>
  `;
  
  elements.resultsPagination.innerHTML = paginationHTML;
  
  // Agregar event listeners
  const pageButtons = elements.resultsPagination.querySelectorAll('.page-number');
  pageButtons.forEach(button => {
    button.addEventListener('click', () => {
      state.currentPage = parseInt(button.dataset.page);
      renderRecipes();
    });
  });
  
  const prevButton = elements.resultsPagination.querySelector('.prev-btn');
  if (prevButton) {
    prevButton.addEventListener('click', () => {
      if (state.currentPage > 1) {
        state.currentPage--;
        renderRecipes();
      }
    });
  }
  
  const nextButton = elements.resultsPagination.querySelector('.next-btn');
  if (nextButton) {
    nextButton.addEventListener('click', () => {
      if (state.currentPage < totalPages) {
        state.currentPage++;
        renderRecipes();
      }
    });
  }
}

// =========================================================
// Gestión de Pestañas
// =========================================================

// Cambiar entre pestañas
function switchTab(tabName) {
  // Actualizar estado activo
  state.activeTab = tabName;
  
  // Actualizar clases de botones de pestaña
  elements.tabBtns.forEach(btn => {
    if (btn.dataset.tab === tabName) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });
  
  // Actualizar contenido de pestañas
  elements.tabContents.forEach(content => {
    if (content.id === tabName) {
      content.classList.add('active');
    } else {
      content.classList.remove('active');
    }
  });
  
  // Renderizar el contenido de la pestaña
  renderRecipes();
}

// =========================================================
// Gestión de Favoritos
// =========================================================

// Alternar estado de favorito
function toggleFavorite(recipeId, buttonElement) {
  const index = state.favorites.indexOf(recipeId);
  
  if (index === -1) {
    // Agregar a favoritos
    state.favorites.push(recipeId);
    buttonElement.classList.add('active');
    buttonElement.textContent = '★';
    
    // Mostrar confirmación
    showToast('Receta agregada a favoritos');
  } else {
    // Quitar de favoritos
    state.favorites.splice(index, 1);
    buttonElement.classList.remove('active');
    buttonElement.textContent = '☆';
    
    // Si estamos en la pestaña de favoritos, re-renderizar
    if (state.activeTab === 'favorites') {
      renderFavoritesTab();
    }
    
    // Mostrar confirmación
    showToast('Receta eliminada de favoritos');
  }
  
  // Guardar en localStorage
  localStorage.setItem('recipeAppFavorites', JSON.stringify(state.favorites));
}

// Mostrar mensaje toast
function showToast(message) {
  // Si ya existe un toast, eliminarlo
  const existingToast = document.querySelector('.toast');
  if (existingToast) {
    existingToast.remove();
  }
  
  // Crear nuevo toast
  const toast = document.createElement('div');
  toast.classList.add('toast');
  toast.textContent = message;
  document.body.appendChild(toast);
  
  // Animar entrada
  setTimeout(() => {
    toast.classList.add('show');
  }, 10);
  
  // Eliminar después de 3 segundos
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => {
      toast.remove();
    }, 300);
  }, 3000);
}

// =========================================================
// Detalle de Recetas
// =========================================================

// Mostrar detalle de receta en modal
function showRecipeDetail(recipeId) {
  const recipe = state.recipes.find(r => r.id === recipeId);
  if (!recipe) return;
  
  elements.recipeDetail.innerHTML = `
    <div class="recipe-detail-header">
      <img src="${recipe.image}" alt="${recipe.title}" class="recipe-detail-image">
      <h2 class="recipe-detail-title">${recipe.title}</h2>
      <div class="recipe-detail-meta">
        <div class="recipe-detail-meta-item">
          <span>Cocina:</span> 
          <span>${recipe.cuisine.charAt(0).toUpperCase() + recipe.cuisine.slice(1)}</span>
        </div>
        <div class="recipe-detail-meta-item">
          <span>Preparación:</span>
          <span>${recipe.prepTime} min</span>
        </div>
        <div class="recipe-detail-meta-item">
          <span>Cocción:</span>
          <span>${recipe.cookTime} min</span>
        </div>
        <div class="recipe-detail-meta-item">
          <span>Porciones:</span>
          <span>${recipe.servings}</span>
        </div>
      </div>
      <div class="recipe-detail-tags">
        ${recipe.tags.map(tag => `<span class="recipe-tag">${tag}</span>`).join('')}
      </div>
      <p class="recipe-detail-description">${recipe.description}</p>
    </div>
    
    <div class="recipe-detail-section">
      <h3>Ingredientes</h3>
      <ul class="recipe-ingredients">
        ${recipe.ingredients.map(ingredient => `
          <li class="recipe-ingredient">${ingredient}</li>
        `).join('')}
      </ul>
    </div>
    
    <div class="recipe-detail-section">
      <h3>Instrucciones</h3>
      <ol class="recipe-instructions">
        ${recipe.instructions.map(instruction => `
          <li class="recipe-instruction">${instruction}</li>
        `).join('')}
      </ol>
    </div>
    
    <div class="recipe-detail-actions">
      <button class="favorite-btn detail-favorite ${state.favorites.includes(recipe.id) ? 'active' : ''}" data-id="${recipe.id}">
        ${state.favorites.includes(recipe.id) ? 'Quitar de favoritos' : 'Agregar a favoritos'}
      </button>
    </div>
  `;
  
  // Mostrar el modal
  elements.recipeModal.style.display = 'block';
  
  // Event listener para botón de favoritos en detalle
  const favBtn = elements.recipeDetail.querySelector('.detail-favorite');
  favBtn.addEventListener('click', () => {
    toggleFavorite(recipe.id, favBtn);
    favBtn.textContent = state.favorites.includes(recipe.id) ? 
      'Quitar de favoritos' : 'Agregar a favoritos';
    favBtn.classList.toggle('active', state.favorites.includes(recipe.id));
    
    // Actualizar también las tarjetas si están visibles
    const cardBtn = document.querySelector(`.favorite-btn[data-id="${recipe.id}"]`);
    if (cardBtn) {
      cardBtn.textContent = state.favorites.includes(recipe.id) ? '★' : '☆';
      cardBtn.classList.toggle('active', state.favorites.includes(recipe.id));
    }
  });
}

// Cerrar modal
function closeModal() {
  elements.recipeModal.style.display = 'none';
}

// =========================================================
// Funciones de utilidad
// =========================================================

function showLoader() {
  elements.loader.style.display = 'block';
}

function hideLoader() {
  elements.loader.style.display = 'none';
}

function showError(message) {
  elements.errorMessage.textContent = message;
  elements.errorContainer.classList.remove('hidden');
  
  setTimeout(() => {
    elements.errorContainer.classList.add('hidden');
  }, 5000);
}

// =========================================================
// Inicialización
// =========================================================
document.addEventListener('DOMContentLoaded', init);
