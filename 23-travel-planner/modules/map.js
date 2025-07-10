/**
 * Módulo de Mapa
 * Maneja la integración con Leaflet para mostrar mapas y lugares
 */
const MapModule = {
  // Referencias al mapa y elementos del DOM
  map: null,
  markers: {},
  routes: [],
  mapContainer: null,
  currentTripId: null,
  
  // Opciones de mapa
  mapOptions: {
    light: {
      tileLayer: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    },
    dark: {
      tileLayer: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
    }
  },
  
  // Iconos personalizados
  icons: {
    hotel: L.icon({
      iconUrl: 'assets/icons/hotel.png',
      iconSize: [32, 32],
      iconAnchor: [16, 32],
      popupAnchor: [0, -32]
    }),
    food: L.icon({
      iconUrl: 'assets/icons/restaurant.png',
      iconSize: [32, 32],
      iconAnchor: [16, 32],
      popupAnchor: [0, -32]
    }),
    attraction: L.icon({
      iconUrl: 'assets/icons/attraction.png',
      iconSize: [32, 32],
      iconAnchor: [16, 32],
      popupAnchor: [0, -32]
    }),
    transport: L.icon({
      iconUrl: 'assets/icons/transport.png',
      iconSize: [32, 32],
      iconAnchor: [16, 32],
      popupAnchor: [0, -32]
    }),
    other: L.icon({
      iconUrl: 'assets/icons/pin.png',
      iconSize: [32, 32],
      iconAnchor: [16, 32],
      popupAnchor: [0, -32]
    })
  },
  
  // Inicializar el mapa
  init: function() {
    this.mapContainer = document.getElementById('map-container');
    
    // Configurar eventos
    document.getElementById('add-place-btn').addEventListener('click', () => {
      this.openAddPlaceModal();
    });
    
    document.getElementById('show-route-btn').addEventListener('click', () => {
      this.toggleRoutes();
    });
    
    // Inicializar mapa
    this.initMap();
    
    // Escuchar el evento de nuevo lugar
    document.getElementById('new-place-form').addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleNewPlace();
    });
    
    // En un mapa real, debemos esperar a que se cargue completamente
    setTimeout(() => {
      if (this.map) {
        this.map.invalidateSize();
      }
    }, 100);
  },
  
  // Inicializar el mapa de Leaflet
  initMap: function() {
    // Si ya existe un mapa, destruirlo
    if (this.map) {
      this.map.remove();
      this.markers = {};
      this.routes = [];
    }
    
    // Crear mapa centrado en una posición por defecto (Barcelona)
    this.map = L.map('map-container').setView([41.3851, 2.1734], 13);
    
    // Añadir capa de mosaicos según el tema
    const isDark = document.body.classList.contains('dark-theme');
    const tileOptions = isDark ? this.mapOptions.dark : this.mapOptions.light;
    
    L.tileLayer(tileOptions.tileLayer, {
      attribution: tileOptions.attribution,
      maxZoom: 19
    }).addTo(this.map);
    
    // Añadir control de escala
    L.control.scale().addTo(this.map);
  },
  
  // Actualizar el tema del mapa
  updateMapTheme: function(isDark) {
    // Eliminar la capa de mosaicos actual
    this.map.eachLayer(layer => {
      if (layer instanceof L.TileLayer) {
        this.map.removeLayer(layer);
      }
    });
    
    // Añadir nueva capa según el tema
    const tileOptions = isDark ? this.mapOptions.dark : this.mapOptions.light;
    
    L.tileLayer(tileOptions.tileLayer, {
      attribution: tileOptions.attribution,
      maxZoom: 19
    }).addTo(this.map);
  },
  
  // Cargar lugares de un viaje en el mapa
  loadTripPlaces: function(tripId) {
    if (!this.map) return;
    
    // Limpiar marcadores actuales
    this.clearMarkers();
    
    this.currentTripId = tripId;
    
    // Obtener lugares del viaje
    const places = StorageModule.getTripPlaces(tripId);
    
    if (places && places.length > 0) {
      // Añadir marcadores para cada lugar
      places.forEach(place => {
        this.addPlaceMarker(place);
      });
      
      // Ajustar la vista para mostrar todos los marcadores
      this.fitMapToMarkers();
    } else {
      // Si no hay lugares, centrar en una ubicación predeterminada
      const trip = StorageModule.getTripById(tripId);
      if (trip && trip.destination === 'Barcelona, España') {
        this.map.setView([41.3851, 2.1734], 13);
      } else {
        this.map.setView([0, 0], 2);
      }
    }
  },
  
  // Añadir marcador para un lugar
  addPlaceMarker: function(place) {
    if (!place.coordinates || !place.coordinates.lat || !place.coordinates.lng) return;
    
    // Seleccionar icono según la categoría
    const icon = this.icons[place.category] || this.icons.other;
    
    // Crear marcador
    const marker = L.marker([place.coordinates.lat, place.coordinates.lng], {
      icon: icon,
      title: place.name
    }).addTo(this.map);
    
    // Añadir popup con información
    marker.bindPopup(`
      <div class="map-popup">
        <h4>${place.name}</h4>
        <p>${place.address || 'Sin dirección'}</p>
        <p class="popup-category">${this.getCategoryName(place.category)}</p>
        ${place.notes ? `<p class="popup-notes">${place.notes}</p>` : ''}
        <div class="popup-actions">
          <button class="popup-edit" data-id="${place.id}">Editar</button>
          <button class="popup-route" data-id="${place.id}">Ruta</button>
        </div>
      </div>
    `);
    
    // Configurar eventos de popup
    marker.on('popupopen', (e) => {
      const popup = e.popup;
      const container = popup.getElement();
      
      // Eventos para botones dentro del popup
      const editBtn = container.querySelector('.popup-edit');
      if (editBtn) {
        editBtn.addEventListener('click', () => {
          const placeId = editBtn.getAttribute('data-id');
          this.editPlace(placeId);
        });
      }
      
      const routeBtn = container.querySelector('.popup-route');
      if (routeBtn) {
        routeBtn.addEventListener('click', () => {
          const placeId = routeBtn.getAttribute('data-id');
          this.showRouteToPlace(placeId);
        });
      }
    });
    
    // Guardar referencia al marcador
    this.markers[place.id] = marker;
  },
  
  // Limpiar todos los marcadores del mapa
  clearMarkers: function() {
    Object.values(this.markers).forEach(marker => {
      this.map.removeLayer(marker);
    });
    
    this.markers = {};
    
    // También limpiar rutas
    this.clearRoutes();
  },
  
  // Limpiar rutas del mapa
  clearRoutes: function() {
    this.routes.forEach(route => {
      this.map.removeLayer(route);
    });
    
    this.routes = [];
  },
  
  // Ajustar la vista del mapa para mostrar todos los marcadores
  fitMapToMarkers: function() {
    if (Object.keys(this.markers).length === 0) return;
    
    const markerGroup = L.featureGroup(Object.values(this.markers));
    this.map.fitBounds(markerGroup.getBounds().pad(0.2));
  },
  
  // Mostrar ruta entre lugares
  toggleRoutes: function() {
    // Si ya hay rutas, eliminarlas
    if (this.routes.length > 0) {
      this.clearRoutes();
      return;
    }
    
    // Obtener lugares del viaje actual
    const places = StorageModule.getTripPlaces(this.currentTripId);
    
    // Agrupar por categoría y prioridad
    const sortedPlaces = [...places].sort((a, b) => {
      const priorityValues = { high: 0, medium: 1, low: 2 };
      return priorityValues[a.priority] - priorityValues[b.priority];
    });
    
    // Si hay más de un lugar, crear rutas entre ellos
    if (sortedPlaces.length > 1) {
      // Crear líneas entre los marcadores
      for (let i = 0; i < sortedPlaces.length - 1; i++) {
        const place1 = sortedPlaces[i];
        const place2 = sortedPlaces[i + 1];
        
        if (!place1.coordinates || !place2.coordinates) continue;
        
        const latlngs = [
          [place1.coordinates.lat, place1.coordinates.lng],
          [place2.coordinates.lat, place2.coordinates.lng]
        ];
        
        const route = L.polyline(latlngs, {
          color: '#4a89dc',
          weight: 3,
          opacity: 0.7,
          dashArray: '5, 10'
        }).addTo(this.map);
        
        // Añadir información de distancia
        const distance = this.calculateDistance(
          place1.coordinates.lat, place1.coordinates.lng,
          place2.coordinates.lat, place2.coordinates.lng
        );
        
        route.bindTooltip(`${distance.toFixed(2)} km`, {
          permanent: true,
          direction: 'center',
          className: 'route-tooltip'
        });
        
        this.routes.push(route);
      }
    }
  },
  
  // Mostrar ruta desde el hotel/alojamiento hacia un lugar específico
  showRouteToPlace: function(placeId) {
    // Limpiar rutas actuales
    this.clearRoutes();
    
    // Obtener el lugar seleccionado
    const targetPlace = StorageModule.getPlaceById(placeId);
    if (!targetPlace || !targetPlace.coordinates) return;
    
    // Buscar alojamiento en el viaje
    const places = StorageModule.getTripPlaces(this.currentTripId);
    const hotel = places.find(place => place.category === 'hotel');
    
    // Si hay hotel, crear ruta desde el hotel hasta el lugar
    if (hotel && hotel.coordinates) {
      const latlngs = [
        [hotel.coordinates.lat, hotel.coordinates.lng],
        [targetPlace.coordinates.lat, targetPlace.coordinates.lng]
      ];
      
      const route = L.polyline(latlngs, {
        color: '#4a89dc',
        weight: 4,
        opacity: 0.8
      }).addTo(this.map);
      
      // Añadir información de distancia
      const distance = this.calculateDistance(
        hotel.coordinates.lat, hotel.coordinates.lng,
        targetPlace.coordinates.lat, targetPlace.coordinates.lng
      );
      
      route.bindTooltip(`${distance.toFixed(2)} km`, {
        permanent: true,
        direction: 'center',
        className: 'route-tooltip'
      });
      
      this.routes.push(route);
      
      // Ajustar la vista para mostrar la ruta completa
      this.map.fitBounds(route.getBounds().pad(0.2));
    }
  },
  
  // Abrir modal para añadir nuevo lugar
  openAddPlaceModal: function() {
    // Si no hay viaje seleccionado, mostrar mensaje
    if (!App.currentTrip) {
      alert('Por favor, selecciona o crea un viaje primero.');
      return;
    }
    
    // Reiniciar el formulario
    document.getElementById('new-place-form').reset();
    
    // Mostrar el modal
    App.openModal('new-place-modal');
    
    // Configurar eventos especiales del mapa
    this.setupMapLocationPicker();
  },
  
  // Configurar selector de ubicación en el mapa
  setupMapLocationPicker: function() {
    // Añadir un evento de clic al mapa para seleccionar ubicación
    const mapClickHandler = (e) => {
      // Crear un marcador temporal
      if (this._tempMarker) {
        this.map.removeLayer(this._tempMarker);
      }
      
      this._tempMarker = L.marker(e.latlng).addTo(this.map)
        .bindPopup('Ubicación seleccionada')
        .openPopup();
      
      // Guardar coordenadas en campos ocultos o variables
      this._selectedLat = e.latlng.lat;
      this._selectedLng = e.latlng.lng;
      
      // Intentar obtener la dirección mediante geocodificación inversa
      this.reverseGeocode(e.latlng.lat, e.latlng.lng)
        .then(address => {
          if (address) {
            document.getElementById('place-address').value = address;
          }
        })
        .catch(err => console.error('Error en geocodificación:', err));
    };
    
    // Añadir el evento al mapa
    this.map.on('click', mapClickHandler);
    
    // Guardar el handler para eliminarlo cuando se cierre el modal
    this._mapClickHandler = mapClickHandler;
    
    // Cuando se cierra el modal, eliminar el evento y marcador temporal
    const modalCloseHandler = () => {
      if (this._mapClickHandler) {
        this.map.off('click', this._mapClickHandler);
        this._mapClickHandler = null;
      }
      
      if (this._tempMarker) {
        this.map.removeLayer(this._tempMarker);
        this._tempMarker = null;
      }
      
      // Eliminar este evento una vez ejecutado
      document.querySelector('#new-place-modal .close-modal').removeEventListener('click', modalCloseHandler);
    };
    
    document.querySelector('#new-place-modal .close-modal').addEventListener('click', modalCloseHandler);
  },
  
  // Manejar el envío del formulario de nuevo lugar
  handleNewPlace: function() {
    // Comprobar si hay coordenadas seleccionadas
    if (!this._selectedLat || !this._selectedLng) {
      alert('Por favor, selecciona una ubicación en el mapa haciendo clic.');
      return false;
    }
    
    // Obtener datos del formulario
    const placeData = {
      tripId: App.currentTrip.id,
      name: document.getElementById('place-name').value,
      category: document.getElementById('place-category').value,
      address: document.getElementById('place-address').value,
      coordinates: {
        lat: this._selectedLat,
        lng: this._selectedLng
      },
      priority: document.getElementById('place-priority').value,
      notes: document.getElementById('place-notes').value
    };
    
    // Guardar el lugar
    const newPlace = StorageModule.createPlace(placeData);
    
    // Añadir marcador al mapa
    this.addPlaceMarker(newPlace);
    
    // Cerrar el modal
    App.closeModal('new-place-modal');
    
    // Actualizar la lista de lugares
    PlacesModule.loadTripPlaces(App.currentTrip.id);
    
    // Limpiar variables temporales
    this._selectedLat = null;
    this._selectedLng = null;
    if (this._tempMarker) {
      this.map.removeLayer(this._tempMarker);
      this._tempMarker = null;
    }
    
    return true;
  },
  
  // Editar un lugar existente
  editPlace: function(placeId) {
    const place = StorageModule.getPlaceById(placeId);
    if (!place) return;
    
    // Rellenar el formulario con los datos del lugar
    document.getElementById('place-name').value = place.name;
    document.getElementById('place-category').value = place.category;
    document.getElementById('place-address').value = place.address || '';
    document.getElementById('place-priority').value = place.priority;
    document.getElementById('place-notes').value = place.notes || '';
    
    // Almacenar las coordenadas
    this._selectedLat = place.coordinates.lat;
    this._selectedLng = place.coordinates.lng;
    
    // Cambiar el título del modal
    const modalTitle = document.querySelector('#new-place-modal .modal-content h2');
    modalTitle.textContent = 'Editar lugar';
    
    // Abrir el modal
    App.openModal('new-place-modal');
    
    // Configurar eventos especiales del mapa
    this.setupMapLocationPicker();
    
    // Si hay coordenadas, añadir un marcador temporal
    if (place.coordinates && place.coordinates.lat && place.coordinates.lng) {
      if (this._tempMarker) {
        this.map.removeLayer(this._tempMarker);
      }
      
      this._tempMarker = L.marker([place.coordinates.lat, place.coordinates.lng]).addTo(this.map)
        .bindPopup('Ubicación actual')
        .openPopup();
      
      // Centrar el mapa en la ubicación
      this.map.setView([place.coordinates.lat, place.coordinates.lng], 15);
    }
    
    // Cambiar el comportamiento del formulario para actualizar en lugar de crear
    const form = document.getElementById('new-place-form');
    const originalSubmitHandler = form.onsubmit;
    
    form.onsubmit = (e) => {
      e.preventDefault();
      
      // Comprobar si hay coordenadas seleccionadas
      if (!this._selectedLat || !this._selectedLng) {
        alert('Por favor, selecciona una ubicación en el mapa haciendo clic.');
        return false;
      }
      
      // Obtener datos actualizados
      const placeData = {
        name: document.getElementById('place-name').value,
        category: document.getElementById('place-category').value,
        address: document.getElementById('place-address').value,
        coordinates: {
          lat: this._selectedLat,
          lng: this._selectedLng
        },
        priority: document.getElementById('place-priority').value,
        notes: document.getElementById('place-notes').value
      };
      
      // Actualizar el lugar
      const updatedPlace = StorageModule.updatePlace(placeId, placeData);
      
      // Actualizar el marcador
      if (this.markers[placeId]) {
        this.map.removeLayer(this.markers[placeId]);
      }
      this.addPlaceMarker(updatedPlace);
      
      // Cerrar el modal
      App.closeModal('new-place-modal');
      
      // Actualizar la lista de lugares
      PlacesModule.loadTripPlaces(App.currentTrip.id);
      
      // Limpiar variables temporales
      this._selectedLat = null;
      this._selectedLng = null;
      if (this._tempMarker) {
        this.map.removeLayer(this._tempMarker);
        this._tempMarker = null;
      }
      
      // Restaurar el título original
      modalTitle.textContent = 'Nuevo lugar';
      
      // Restaurar el comportamiento original del formulario
      form.onsubmit = originalSubmitHandler;
      
      return true;
    };
  },
  
  // Refrescar el mapa (útil cuando cambia el tamaño del contenedor)
  refreshMap: function() {
    if (this.map) {
      this.map.invalidateSize();
    }
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
  
  // Calcular distancia entre dos puntos en km (fórmula de Haversine)
  calculateDistance: function(lat1, lon1, lat2, lon2) {
    const R = 6371; // Radio de la Tierra en km
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2); 
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    const distance = R * c; // Distancia en km
    return distance;
  },
  
  // Convertir grados a radianes
  deg2rad: function(deg) {
    return deg * (Math.PI/180);
  },
  
  // Geocodificación inversa (obtener dirección a partir de coordenadas)
  // En una aplicación real, usaríamos un servicio como Nominatim, Google Maps, etc.
  reverseGeocode: async function(lat, lng) {
    try {
      // Simulación de llamada API
      // En una app real, haríamos una petición a un servicio de geocodificación
      return `Lat: ${lat.toFixed(6)}, Lng: ${lng.toFixed(6)}`;
      
      // Ejemplo con Nominatim (requiere proxy en producción debido a CORS)
      /*
      const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
      const data = await response.json();
      return data.display_name;
      */
    } catch (error) {
      console.error('Error en geocodificación inversa:', error);
      return null;
    }
  }
};
