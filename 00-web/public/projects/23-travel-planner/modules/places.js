/**
 * Módulo de Lugares
 * Maneja la gestión y visualización de lugares para visitar
 */
const PlacesModule = {
  // Referencia al contenedor de lugares
  placesContainer: null,
  
  // Estado interno del módulo
  currentTripId: null,
  currentFilters: {
    category: '',
    priority: '',
    search: ''
  },
  
  // Inicializar el módulo
  init: function() {
    this.placesContainer = document.getElementById('places-container');
    
    // Configurar eventos
    this.setupEventListeners();
  },
  
  // Configurar escuchadores de eventos
  setupEventListeners: function() {
    // Filtros
    document.getElementById('category-filter').addEventListener('change', () => {
      this.currentFilters.category = document.getElementById('category-filter').value;
      this.applyFilters();
    });
    
    document.getElementById('priority-filter').addEventListener('change', () => {
      this.currentFilters.priority = document.getElementById('priority-filter').value;
      this.applyFilters();
    });
    
    document.getElementById('place-search').addEventListener('input', () => {
      this.currentFilters.search = document.getElementById('place-search').value.toLowerCase();
      this.applyFilters();
    });
    
    // Botón de añadir lugar desde la lista
    document.getElementById('add-place-list-btn').addEventListener('click', () => {
      if (App.currentTrip) {
        App.switchTab('map');
        MapModule.openAddPlaceModal();
      } else {
        alert('Por favor, selecciona o crea un viaje primero.');
      }
    });
  },
  
  // Cargar lugares de un viaje
  loadTripPlaces: function(tripId) {
    this.currentTripId = tripId;
    
    // Resetear filtros
    document.getElementById('category-filter').value = '';
    document.getElementById('priority-filter').value = '';
    document.getElementById('place-search').value = '';
    this.currentFilters = {
      category: '',
      priority: '',
      search: ''
    };
    
    // Obtener lugares del viaje
    const places = StorageModule.getTripPlaces(tripId);
    
    // Renderizar lugares
    this.renderPlaces(places);
  },
  
  // Renderizar lugares en el contenedor
  renderPlaces: function(places) {
    // Limpiar contenedor
    this.placesContainer.innerHTML = '';
    
    // Si no hay lugares, mostrar mensaje
    if (!places || places.length === 0) {
      this.placesContainer.innerHTML = `
        <div class="no-places">
          <p>No hay lugares guardados para este viaje.</p>
          <p>Haz clic en el botón "+" para añadir un lugar.</p>
        </div>
      `;
      return;
    }
    
    // Ordenar lugares por prioridad
    const sortedPlaces = [...places].sort((a, b) => {
      const priorityValues = { high: 0, medium: 1, low: 2 };
      return priorityValues[a.priority] - priorityValues[b.priority];
    });
    
    // Crear tarjetas para cada lugar
    sortedPlaces.forEach(place => {
      const placeCard = document.createElement('div');
      placeCard.className = `place-card priority-${place.priority}`;
      placeCard.dataset.id = place.id;
      
      placeCard.innerHTML = `
        <h4>${place.name}</h4>
        <div class="place-category">${this.getCategoryName(place.category)}</div>
        <div class="place-priority ${place.priority}">Prioridad: ${this.getPriorityName(place.priority)}</div>
        ${place.address ? `<div class="place-address">${place.address}</div>` : ''}
        ${place.notes ? `<div class="place-notes">${place.notes}</div>` : ''}
        <div class="place-actions">
          <button class="view-btn">Ver en mapa</button>
          <button class="edit-btn">Editar</button>
          <button class="delete-btn">Eliminar</button>
        </div>
      `;
      
      // Configurar eventos de los botones
      const viewBtn = placeCard.querySelector('.view-btn');
      viewBtn.addEventListener('click', () => {
        App.switchTab('map');
        
        // Centrar mapa en el lugar y abrir popup
        setTimeout(() => {
          if (MapModule.markers[place.id]) {
            MapModule.map.setView(
              [place.coordinates.lat, place.coordinates.lng],
              15
            );
            MapModule.markers[place.id].openPopup();
          }
        }, 100);
      });
      
      const editBtn = placeCard.querySelector('.edit-btn');
      editBtn.addEventListener('click', () => {
        App.switchTab('map');
        
        // Abrir formulario de edición
        setTimeout(() => {
          MapModule.editPlace(place.id);
        }, 100);
      });
      
      const deleteBtn = placeCard.querySelector('.delete-btn');
      deleteBtn.addEventListener('click', () => {
        this.deletePlace(place.id);
      });
      
      this.placesContainer.appendChild(placeCard);
    });
  },
  
  // Aplicar filtros a la lista de lugares
  applyFilters: function() {
    if (!this.currentTripId) return;
    
    // Obtener todos los lugares del viaje
    let places = StorageModule.getTripPlaces(this.currentTripId);
    
    // Aplicar filtro de categoría
    if (this.currentFilters.category) {
      places = places.filter(place => place.category === this.currentFilters.category);
    }
    
    // Aplicar filtro de prioridad
    if (this.currentFilters.priority) {
      places = places.filter(place => place.priority === this.currentFilters.priority);
    }
    
    // Aplicar búsqueda de texto
    if (this.currentFilters.search) {
      places = places.filter(place => 
        place.name.toLowerCase().includes(this.currentFilters.search) ||
        (place.address && place.address.toLowerCase().includes(this.currentFilters.search)) ||
        (place.notes && place.notes.toLowerCase().includes(this.currentFilters.search))
      );
    }
    
    // Renderizar lugares filtrados
    this.renderPlaces(places);
  },
  
  // Eliminar un lugar
  deletePlace: function(placeId) {
    // Pedir confirmación
    if (!confirm('¿Estás seguro de que deseas eliminar este lugar?')) {
      return;
    }
    
    // Eliminar lugar del almacenamiento
    StorageModule.deletePlace(placeId);
    
    // Eliminar marcador del mapa
    if (MapModule.markers[placeId]) {
      MapModule.map.removeLayer(MapModule.markers[placeId]);
      delete MapModule.markers[placeId];
    }
    
    // Actualizar la lista de lugares
    this.loadTripPlaces(this.currentTripId);
  },
  
  // Obtener nombre de categoría en español
  getCategoryName: function(category) {
    const categories = {
      hotel: 'Alojamiento',
      food: 'Restaurante',
      attraction: 'Atracción',
      transport: 'Transporte',
      other: 'Otro'
    };
    
    return categories[category] || 'Otro';
  },
  
  // Obtener nombre de prioridad en español
  getPriorityName: function(priority) {
    const priorities = {
      high: 'Alta',
      medium: 'Media',
      low: 'Baja'
    };
    
    return priorities[priority] || 'Media';
  }
};
