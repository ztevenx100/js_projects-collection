/**
 * Módulo de Itinerario
 * Maneja la gestión y visualización del itinerario diario del viaje
 */
const ItineraryModule = {
  // Referencias a elementos del DOM
  daysContainer: null,
  dayViewContainer: null,
  
  // Estado interno del módulo
  currentTrip: null,
  currentDay: 1,
  tripDays: 0,
  activities: [],
  
  // Inicializar el módulo
  init: function() {
    this.daysContainer = document.getElementById('itinerary-days');
    this.dayViewContainer = document.getElementById('day-timeline');
    
    // Configurar eventos
    this.setupEventListeners();
  },
  
  // Configurar escuchadores de eventos
  setupEventListeners: function() {
    // Los eventos de día se crean dinámicamente cuando se cargan los días
  },
  
  // Cargar itinerario de un viaje
  loadTripItinerary: function(tripId) {
    // Obtener datos del viaje
    const trip = StorageModule.getTripById(tripId);
    if (!trip) return;
    
    this.currentTrip = trip;
    
    // Calcular número de días del viaje
    const startDate = new Date(trip.startDate);
    const endDate = new Date(trip.endDate);
    const diffTime = Math.abs(endDate - startDate);
    this.tripDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    
    // Obtener actividades del viaje
    this.activities = StorageModule.getTripActivities(tripId);
    
    // Renderizar días
    this.renderDays();
    
    // Seleccionar primer día por defecto
    if (this.tripDays > 0) {
      this.selectDay(1);
    }
  },
  
  // Renderizar días del viaje
  renderDays: function() {
    // Limpiar contenedor
    this.daysContainer.innerHTML = '';
    
    // Si no hay días, mostrar mensaje
    if (this.tripDays <= 0) {
      this.daysContainer.innerHTML = '<p class="no-days">No hay días disponibles en este viaje.</p>';
      return;
    }
    
    // Crear elemento para cada día
    for (let day = 1; day <= this.tripDays; day++) {
      const dayDate = new Date(this.currentTrip.startDate);
      dayDate.setDate(dayDate.getDate() + (day - 1));
      
      const dayElement = document.createElement('div');
      dayElement.className = 'day-item';
      dayElement.dataset.day = day;
      
      dayElement.innerHTML = `
        <div class="day-number">Día ${day}</div>
        <div class="day-date">${this.formatDate(dayDate)}</div>
      `;
      
      // Configurar evento de clic para seleccionar día
      dayElement.addEventListener('click', () => {
        this.selectDay(day);
      });
      
      this.daysContainer.appendChild(dayElement);
    }
  },
  
  // Seleccionar un día del itinerario
  selectDay: function(day) {
    // Actualizar estado
    this.currentDay = day;
    
    // Actualizar clase activa en la lista de días
    document.querySelectorAll('.day-item').forEach(element => {
      element.classList.remove('active');
    });
    
    const activeDayElement = document.querySelector(`.day-item[data-day="${day}"]`);
    if (activeDayElement) {
      activeDayElement.classList.add('active');
    }
    
    // Calcular la fecha del día seleccionado
    const dayDate = new Date(this.currentTrip.startDate);
    dayDate.setDate(dayDate.getDate() + (day - 1));
    
    // Actualizar título del día
    document.getElementById('day-title').textContent = `Día ${day} - ${this.formatDate(dayDate)}`;
    
    // Cargar actividades del día
    this.loadDayActivities(day);
  },
  
  // Cargar actividades de un día específico
  loadDayActivities: function(day) {
    // Limpiar contenedor
    this.dayViewContainer.innerHTML = '';
    
    // Filtrar actividades del día seleccionado
    const dayActivities = this.activities.filter(activity => activity.day === day);
    
    // Si no hay actividades, mostrar mensaje
    if (dayActivities.length === 0) {
      this.dayViewContainer.innerHTML = `
        <div class="no-activities">
          <p>No hay actividades programadas para este día.</p>
          <button id="add-activity-btn">Añadir actividad</button>
        </div>
      `;
      
      // Configurar evento del botón
      document.getElementById('add-activity-btn').addEventListener('click', () => {
        this.openAddActivityModal(day);
      });
      
      return;
    }
    
    // Ordenar actividades por hora
    const sortedActivities = [...dayActivities].sort((a, b) => {
      return this.timeToMinutes(a.time) - this.timeToMinutes(b.time);
    });
    
    // Crear elemento para cada actividad
    sortedActivities.forEach(activity => {
      const activityElement = document.createElement('div');
      activityElement.className = 'timeline-item';
      activityElement.dataset.id = activity.id;
      
      // Obtener información del lugar si existe
      let placeInfo = '';
      if (activity.placeId) {
        const place = StorageModule.getPlaceById(activity.placeId);
        if (place) {
          placeInfo = `<div class="timeline-place">${place.name}</div>`;
        }
      }
      
      activityElement.innerHTML = `
        <div class="timeline-time">${activity.time}</div>
        <h4>${activity.title}</h4>
        ${placeInfo}
        ${activity.notes ? `<div class="timeline-notes">${activity.notes}</div>` : ''}
        <div class="timeline-actions">
          <button class="edit-btn">Editar</button>
          <button class="delete-btn">Eliminar</button>
        </div>
      `;
      
      // Configurar eventos de los botones
      const editBtn = activityElement.querySelector('.edit-btn');
      editBtn.addEventListener('click', () => {
        this.editActivity(activity.id);
      });
      
      const deleteBtn = activityElement.querySelector('.delete-btn');
      deleteBtn.addEventListener('click', () => {
        this.deleteActivity(activity.id);
      });
      
      this.dayViewContainer.appendChild(activityElement);
    });
    
    // Añadir botón para añadir nueva actividad
    const addButtonContainer = document.createElement('div');
    addButtonContainer.className = 'add-activity-container';
    addButtonContainer.innerHTML = `<button id="add-activity-btn">+ Añadir actividad</button>`;
    this.dayViewContainer.appendChild(addButtonContainer);
    
    // Configurar evento del botón
    document.getElementById('add-activity-btn').addEventListener('click', () => {
      this.openAddActivityModal(day);
    });
  },
  
  // Abrir modal para añadir nueva actividad
  openAddActivityModal: function(day) {
    // Si no hay viaje seleccionado, mostrar mensaje
    if (!this.currentTrip) {
      alert('Por favor, selecciona o crea un viaje primero.');
      return;
    }
    
    // Crear modal dinámicamente si no existe
    let activityModal = document.getElementById('new-activity-modal');
    if (!activityModal) {
      activityModal = document.createElement('div');
      activityModal.id = 'new-activity-modal';
      activityModal.className = 'modal';
      
      activityModal.innerHTML = `
        <div class="modal-content">
          <span class="close-modal">&times;</span>
          <h2>Nueva actividad</h2>
          <form id="new-activity-form">
            <div class="form-group">
              <label for="activity-day">Día</label>
              <select id="activity-day" required></select>
            </div>
            <div class="form-group">
              <label for="activity-time">Hora</label>
              <input type="time" id="activity-time" required>
            </div>
            <div class="form-group">
              <label for="activity-title">Título</label>
              <input type="text" id="activity-title" required>
            </div>
            <div class="form-group">
              <label for="activity-place">Lugar (opcional)</label>
              <select id="activity-place">
                <option value="">-- Selecciona un lugar --</option>
              </select>
            </div>
            <div class="form-group">
              <label for="activity-notes">Notas</label>
              <textarea id="activity-notes" rows="3"></textarea>
            </div>
            <button type="submit" class="submit-btn">Guardar</button>
          </form>
        </div>
      `;
      
      document.body.appendChild(activityModal);
      
      // Configurar eventos del modal
      activityModal.querySelector('.close-modal').addEventListener('click', () => {
        this.closeActivityModal();
      });
      
      activityModal.addEventListener('click', (e) => {
        if (e.target === activityModal) {
          this.closeActivityModal();
        }
      });
      
      // Configurar evento del formulario
      document.getElementById('new-activity-form').addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleNewActivity();
      });
    }
    
    // Llenar selector de días
    const daySelect = document.getElementById('activity-day');
    daySelect.innerHTML = '';
    
    for (let i = 1; i <= this.tripDays; i++) {
      const dayDate = new Date(this.currentTrip.startDate);
      dayDate.setDate(dayDate.getDate() + (i - 1));
      
      const option = document.createElement('option');
      option.value = i;
      option.textContent = `Día ${i} - ${this.formatDate(dayDate)}`;
      
      if (i === day) {
        option.selected = true;
      }
      
      daySelect.appendChild(option);
    }
    
    // Llenar selector de lugares
    const placeSelect = document.getElementById('activity-place');
    placeSelect.innerHTML = '<option value="">-- Selecciona un lugar --</option>';
    
    const places = StorageModule.getTripPlaces(this.currentTrip.id);
    places.forEach(place => {
      const option = document.createElement('option');
      option.value = place.id;
      option.textContent = place.name;
      placeSelect.appendChild(option);
    });
    
    // Mostrar modal
    activityModal.style.display = 'block';
  },
  
  // Cerrar modal de actividad
  closeActivityModal: function() {
    const modal = document.getElementById('new-activity-modal');
    if (modal) {
      modal.style.display = 'none';
    }
  },
  
  // Manejar envío del formulario de nueva actividad
  handleNewActivity: function() {
    // Obtener datos del formulario
    const activityData = {
      tripId: this.currentTrip.id,
      day: parseInt(document.getElementById('activity-day').value),
      time: document.getElementById('activity-time').value,
      title: document.getElementById('activity-title').value,
      placeId: document.getElementById('activity-place').value || null,
      notes: document.getElementById('activity-notes').value
    };
    
    // Si no se seleccionó un lugar, establecer como null
    if (activityData.placeId === '') {
      activityData.placeId = null;
    }
    
    // Crear nueva actividad
    const newActivity = StorageModule.createActivity(activityData);
    
    // Actualizar actividades
    this.activities.push(newActivity);
    
    // Si la actividad es para el día actual, actualizar la vista
    if (activityData.day === this.currentDay) {
      this.loadDayActivities(this.currentDay);
    }
    
    // Cerrar modal
    this.closeActivityModal();
  },
  
  // Editar una actividad existente
  editActivity: function(activityId) {
    // Obtener la actividad
    const activity = StorageModule.getActivityById(activityId);
    if (!activity) return;
    
    // Abrir modal
    this.openAddActivityModal(activity.day);
    
    // Cambiar título del modal
    const modalTitle = document.querySelector('#new-activity-modal .modal-content h2');
    modalTitle.textContent = 'Editar actividad';
    
    // Llenar formulario con datos de la actividad
    document.getElementById('activity-day').value = activity.day;
    document.getElementById('activity-time').value = activity.time;
    document.getElementById('activity-title').value = activity.title;
    document.getElementById('activity-place').value = activity.placeId || '';
    document.getElementById('activity-notes').value = activity.notes || '';
    
    // Cambiar comportamiento del formulario para actualizar en lugar de crear
    const form = document.getElementById('new-activity-form');
    const originalSubmitHandler = form.onsubmit;
    
    form.onsubmit = (e) => {
      e.preventDefault();
      
      // Obtener datos actualizados
      const activityData = {
        day: parseInt(document.getElementById('activity-day').value),
        time: document.getElementById('activity-time').value,
        title: document.getElementById('activity-title').value,
        placeId: document.getElementById('activity-place').value || null,
        notes: document.getElementById('activity-notes').value
      };
      
      // Si no se seleccionó un lugar, establecer como null
      if (activityData.placeId === '') {
        activityData.placeId = null;
      }
      
      // Actualizar actividad
      const updatedActivity = StorageModule.updateActivity(activityId, activityData);
      
      // Actualizar lista de actividades
      const index = this.activities.findIndex(act => act.id === activityId);
      if (index !== -1) {
        this.activities[index] = updatedActivity;
      }
      
      // Si cambió el día, recargar el día actual
      if (activity.day !== activityData.day) {
        // Si estamos viendo el día anterior, actualizar vista
        if (activity.day === this.currentDay) {
          this.loadDayActivities(this.currentDay);
        } 
        // Si estamos viendo el nuevo día, actualizar vista
        else if (activityData.day === this.currentDay) {
          this.loadDayActivities(this.currentDay);
        }
      } else if (activity.day === this.currentDay) {
        // Si la actividad sigue en el mismo día y es el actual, actualizar vista
        this.loadDayActivities(this.currentDay);
      }
      
      // Cerrar modal
      this.closeActivityModal();
      
      // Restaurar título original
      modalTitle.textContent = 'Nueva actividad';
      
      // Restaurar comportamiento original del formulario
      form.onsubmit = originalSubmitHandler;
    };
  },
  
  // Eliminar una actividad
  deleteActivity: function(activityId) {
    // Pedir confirmación
    if (!confirm('¿Estás seguro de que deseas eliminar esta actividad?')) {
      return;
    }
    
    // Obtener actividad para saber el día
    const activity = StorageModule.getActivityById(activityId);
    if (!activity) return;
    
    const day = activity.day;
    
    // Eliminar actividad
    StorageModule.deleteActivity(activityId);
    
    // Actualizar lista de actividades
    this.activities = this.activities.filter(act => act.id !== activityId);
    
    // Si la actividad era del día actual, actualizar vista
    if (day === this.currentDay) {
      this.loadDayActivities(this.currentDay);
    }
  },
  
  // Convertir hora a minutos para ordenar
  timeToMinutes: function(timeStr) {
    if (!timeStr) return 0;
    
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
  },
  
  // Formatear fecha
  formatDate: function(date) {
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }
};
