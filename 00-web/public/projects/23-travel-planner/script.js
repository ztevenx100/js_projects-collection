/**
 * Travel Planner - Script principal
 * Este archivo coordina la funcionalidad general de la aplicación y la interacción entre módulos.
 */

// Estado global de la aplicación
const App = {
  currentTrip: null,
  activeTab: 'map',
  isDarkTheme: false,
  
  // Inicialización de la aplicación
  init: async function() {
    // Cargar tema guardado
    this.loadTheme();
    
    // Inicializar los módulos
    await StorageModule.init();
    MapModule.init();
    PlacesModule.init();
    BudgetModule.init();
    ItineraryModule.init();
    
    // Cargar datos iniciales
    this.loadTrips();
    
    // Configurar eventos de UI
    this.setupEventListeners();
    
    console.log('Travel Planner initialized');
  },
  
  // Cargar viajes desde el almacenamiento
  loadTrips: function() {
    const trips = StorageModule.getTrips();
    const tripSelect = document.getElementById('trip-select');
    
    // Limpiar opciones existentes excepto la primera
    while (tripSelect.options.length > 1) {
      tripSelect.remove(1);
    }
    
    // Añadir opciones de viaje
    if (trips && trips.length > 0) {
      trips.forEach(trip => {
        const option = document.createElement('option');
        option.value = trip.id;
        option.textContent = trip.name;
        tripSelect.appendChild(option);
      });
    }
  },
  
  // Seleccionar un viaje
  selectTrip: function(tripId) {
    if (!tripId) {
      this.currentTrip = null;
      document.getElementById('trip-info').classList.add('hidden');
      return;
    }
    
    const trip = StorageModule.getTripById(tripId);
    if (trip) {
      this.currentTrip = trip;
      
      // Actualizar información del viaje
      document.getElementById('trip-title').textContent = trip.name;
      document.getElementById('trip-dates').textContent = `Fechas: ${this.formatDate(trip.startDate)} - ${this.formatDate(trip.endDate)}`;
      document.getElementById('trip-budget').textContent = `Presupuesto: ${this.formatCurrency(trip.budget, trip.currency)}`;
      
      // Mostrar la sección de información
      document.getElementById('trip-info').classList.remove('hidden');
      
      // Actualizar módulos
      MapModule.loadTripPlaces(trip.id);
      PlacesModule.loadTripPlaces(trip.id);
      BudgetModule.loadTripBudget(trip.id);
      ItineraryModule.loadTripItinerary(trip.id);
    }
  },
  
  // Crear un nuevo viaje
  createTrip: function(tripData) {
    const newTrip = StorageModule.createTrip(tripData);
    this.loadTrips();
    document.getElementById('trip-select').value = newTrip.id;
    this.selectTrip(newTrip.id);
    return newTrip;
  },
  
  // Editar un viaje existente
  updateTrip: function(tripId, tripData) {
    const updatedTrip = StorageModule.updateTrip(tripId, tripData);
    this.loadTrips();
    this.selectTrip(updatedTrip.id);
    return updatedTrip;
  },
  
  // Cambiar de pestaña
  switchTab: function(tabId) {
    // Desactivar todas las pestañas
    document.querySelectorAll('.tab-btn').forEach(tab => {
      tab.classList.remove('active');
    });
    
    document.querySelectorAll('.tab-content').forEach(content => {
      content.classList.remove('active');
    });
    
    // Activar la pestaña seleccionada
    document.querySelector(`.tab-btn[data-tab="${tabId}"]`).classList.add('active');
    document.getElementById(tabId).classList.add('active');
    
    this.activeTab = tabId;
    
    // Actualizar UI específica de la pestaña
    if (tabId === 'map' && this.currentTrip) {
      MapModule.refreshMap();
    }
  },
  
  // Cargar y aplicar tema
  loadTheme: function() {
    const savedTheme = localStorage.getItem('travelPlannerTheme');
    if (savedTheme === 'dark') {
      document.body.classList.add('dark-theme');
      document.getElementById('theme-toggle').checked = true;
      this.isDarkTheme = true;
    } else {
      document.body.classList.remove('dark-theme');
      document.getElementById('theme-toggle').checked = false;
      this.isDarkTheme = false;
    }
  },
  
  // Cambiar tema
  toggleTheme: function() {
    if (document.body.classList.contains('dark-theme')) {
      document.body.classList.remove('dark-theme');
      localStorage.setItem('travelPlannerTheme', 'light');
      this.isDarkTheme = false;
    } else {
      document.body.classList.add('dark-theme');
      localStorage.setItem('travelPlannerTheme', 'dark');
      this.isDarkTheme = true;
    }
    
    // Actualizar mapa si está visible
    if (this.activeTab === 'map') {
      MapModule.updateMapTheme(this.isDarkTheme);
    }
  },
  
  // Configurar escuchadores de eventos
  setupEventListeners: function() {
    // Selector de tema
    document.getElementById('theme-toggle').addEventListener('change', () => {
      this.toggleTheme();
    });
    
    // Selector de viajes
    document.getElementById('trip-select').addEventListener('change', (e) => {
      this.selectTrip(e.target.value);
    });
    
    // Botón de nuevo viaje
    document.getElementById('new-trip-btn').addEventListener('click', () => {
      this.openNewTripModal();
    });
    
    // Botón de editar viaje
    document.getElementById('edit-trip-btn').addEventListener('click', () => {
      if (this.currentTrip) {
        this.openEditTripModal(this.currentTrip);
      }
    });
    
    // Pestañas
    document.querySelectorAll('.tab-btn').forEach(tab => {
      tab.addEventListener('click', () => {
        this.switchTab(tab.dataset.tab);
      });
    });
    
    // Modal de nuevo viaje
    document.getElementById('new-trip-form').addEventListener('submit', (e) => {
      e.preventDefault();
      
      const tripData = {
        name: document.getElementById('trip-name').value,
        destination: document.getElementById('trip-destination').value,
        startDate: document.getElementById('trip-start-date').value,
        endDate: document.getElementById('trip-end-date').value,
        budget: parseFloat(document.getElementById('trip-budget-amount').value),
        currency: document.getElementById('trip-currency').value
      };
      
      this.createTrip(tripData);
      this.closeModal('new-trip-modal');
    });
    
    // Botones para cerrar modales
    document.querySelectorAll('.close-modal').forEach(button => {
      button.addEventListener('click', () => {
        const modal = button.closest('.modal');
        this.closeModal(modal.id);
      });
    });
    
    // Cerrar modales al hacer clic fuera
    document.querySelectorAll('.modal').forEach(modal => {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          this.closeModal(modal.id);
        }
      });
    });
  },
  
  // Abrir modal de nuevo viaje
  openNewTripModal: function() {
    // Resetear formulario
    document.getElementById('new-trip-form').reset();
    
    // Establecer fecha mínima como hoy
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('trip-start-date').min = today;
    document.getElementById('trip-end-date').min = today;
    
    // Mostrar modal
    this.openModal('new-trip-modal');
  },
  
  // Abrir modal de editar viaje
  openEditTripModal: function(trip) {
    // Rellenar el formulario con los datos del viaje
    document.getElementById('trip-name').value = trip.name;
    document.getElementById('trip-destination').value = trip.destination;
    document.getElementById('trip-start-date').value = trip.startDate;
    document.getElementById('trip-end-date').value = trip.endDate;
    document.getElementById('trip-budget-amount').value = trip.budget;
    document.getElementById('trip-currency').value = trip.currency;
    
    // Cambiar el título del modal
    const modalTitle = document.querySelector('#new-trip-modal .modal-content h2');
    modalTitle.textContent = 'Editar viaje';
    
    // Cambiar el comportamiento del formulario para actualizar en lugar de crear
    const form = document.getElementById('new-trip-form');
    const originalSubmitHandler = form.onsubmit;
    
    form.onsubmit = (e) => {
      e.preventDefault();
      
      const tripData = {
        name: document.getElementById('trip-name').value,
        destination: document.getElementById('trip-destination').value,
        startDate: document.getElementById('trip-start-date').value,
        endDate: document.getElementById('trip-end-date').value,
        budget: parseFloat(document.getElementById('trip-budget-amount').value),
        currency: document.getElementById('trip-currency').value
      };
      
      this.updateTrip(trip.id, tripData);
      this.closeModal('new-trip-modal');
      
      // Restaurar el comportamiento original del formulario
      form.onsubmit = originalSubmitHandler;
    };
    
    // Mostrar modal
    this.openModal('new-trip-modal');
  },
  
  // Abrir modal genérico
  openModal: function(modalId) {
    document.getElementById(modalId).style.display = 'block';
  },
  
  // Cerrar modal genérico
  closeModal: function(modalId) {
    document.getElementById(modalId).style.display = 'none';
    
    // Si es el modal de viaje, restaurar título original
    if (modalId === 'new-trip-modal') {
      const modalTitle = document.querySelector('#new-trip-modal .modal-content h2');
      modalTitle.textContent = 'Nuevo viaje';
    }
  },
  
  // Formatear fecha
  formatDate: function(dateString) {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    return date.toLocaleDateString();
  },
  
  // Formatear moneda
  formatCurrency: function(amount, currency = 'USD') {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: currency
    }).format(amount);
  }
};

// Inicializar la aplicación cuando el DOM está listo
document.addEventListener('DOMContentLoaded', () => {
  App.init();
});
