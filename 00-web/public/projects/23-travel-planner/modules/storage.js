/**
 * Módulo de Almacenamiento
 * Maneja la persistencia de datos en localStorage y proporciona una API para acceder a los datos
 */
const StorageModule = {
  // Claves para localStorage
  STORAGE_KEYS: {
    TRIPS: 'travelPlanner_trips',
    PLACES: 'travelPlanner_places',
    EXPENSES: 'travelPlanner_expenses',
    ACTIVITIES: 'travelPlanner_activities'
  },
  
  // Datos en memoria
  data: {
    trips: [],
    places: [],
    expenses: [],
    activities: []
  },
  
  // Inicializar el módulo
  init: async function() {
    // Cargar datos desde localStorage
    this.loadData();
    
    // Si no hay datos, crear datos de ejemplo para demostración
    if (this.data.trips.length === 0) {
      this.createSampleData();
    }
    
    return true;
  },
  
  // Cargar datos desde localStorage
  loadData: function() {
    // Cargar viajes
    const tripsData = localStorage.getItem(this.STORAGE_KEYS.TRIPS);
    if (tripsData) {
      this.data.trips = JSON.parse(tripsData);
    }
    
    // Cargar lugares
    const placesData = localStorage.getItem(this.STORAGE_KEYS.PLACES);
    if (placesData) {
      this.data.places = JSON.parse(placesData);
    }
    
    // Cargar gastos
    const expensesData = localStorage.getItem(this.STORAGE_KEYS.EXPENSES);
    if (expensesData) {
      this.data.expenses = JSON.parse(expensesData);
    }
    
    // Cargar actividades
    const activitiesData = localStorage.getItem(this.STORAGE_KEYS.ACTIVITIES);
    if (activitiesData) {
      this.data.activities = JSON.parse(activitiesData);
    }
  },
  
  // Guardar datos en localStorage
  saveData: function() {
    localStorage.setItem(this.STORAGE_KEYS.TRIPS, JSON.stringify(this.data.trips));
    localStorage.setItem(this.STORAGE_KEYS.PLACES, JSON.stringify(this.data.places));
    localStorage.setItem(this.STORAGE_KEYS.EXPENSES, JSON.stringify(this.data.expenses));
    localStorage.setItem(this.STORAGE_KEYS.ACTIVITIES, JSON.stringify(this.data.activities));
  },
  
  // Crear datos de ejemplo
  createSampleData: function() {
    // Crear un viaje de ejemplo
    const tripId = this.generateId();
    const today = new Date();
    const startDate = new Date();
    startDate.setDate(today.getDate() + 30); // Un mes en el futuro
    
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 7); // Una semana de duración
    
    const trip = {
      id: tripId,
      name: 'Viaje a Barcelona',
      destination: 'Barcelona, España',
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
      budget: 1200,
      currency: 'EUR',
      createdAt: new Date().toISOString()
    };
    
    this.data.trips.push(trip);
    
    // Crear lugares de ejemplo
    const places = [
      {
        id: this.generateId(),
        tripId: tripId,
        name: 'Sagrada Familia',
        category: 'attraction',
        address: 'Carrer de Mallorca, 401, 08013 Barcelona, España',
        coordinates: { lat: 41.4036, lng: 2.1744 },
        priority: 'high',
        notes: 'Comprar entradas con anticipación',
        createdAt: new Date().toISOString()
      },
      {
        id: this.generateId(),
        tripId: tripId,
        name: 'Hotel Arts Barcelona',
        category: 'hotel',
        address: 'Carrer de la Marina, 19-21, 08005 Barcelona, España',
        coordinates: { lat: 41.3865, lng: 2.1974 },
        priority: 'medium',
        notes: 'Check-in: 15:00, Check-out: 12:00',
        createdAt: new Date().toISOString()
      },
      {
        id: this.generateId(),
        tripId: tripId,
        name: 'Restaurante Can Solé',
        category: 'food',
        address: 'Carrer de Sant Carles, 4, 08003 Barcelona, España',
        coordinates: { lat: 41.3795, lng: 2.1896 },
        priority: 'medium',
        notes: 'Famoso por su paella',
        createdAt: new Date().toISOString()
      }
    ];
    
    this.data.places.push(...places);
    
    // Crear gastos de ejemplo
    const expenses = [
      {
        id: this.generateId(),
        tripId: tripId,
        description: 'Vuelos Barcelona',
        amount: 250,
        category: 'transportation',
        date: startDate.toISOString().split('T')[0],
        notes: 'Vuelo directo',
        createdAt: new Date().toISOString()
      },
      {
        id: this.generateId(),
        tripId: tripId,
        description: 'Hotel Arts (7 noches)',
        amount: 700,
        category: 'accommodation',
        date: startDate.toISOString().split('T')[0],
        notes: 'Habitación doble con desayuno',
        createdAt: new Date().toISOString()
      }
    ];
    
    this.data.expenses.push(...expenses);
    
    // Crear actividades de ejemplo para el itinerario
    const activities = [
      {
        id: this.generateId(),
        tripId: tripId,
        day: 1, // Primer día del viaje
        title: 'Check-in en Hotel Arts',
        time: '15:00',
        placeId: places[1].id, // ID del hotel
        notes: 'Llevar pasaporte para el check-in',
        createdAt: new Date().toISOString()
      },
      {
        id: this.generateId(),
        tripId: tripId,
        day: 2, // Segundo día del viaje
        title: 'Visita a Sagrada Familia',
        time: '10:00',
        placeId: places[0].id, // ID de la Sagrada Familia
        notes: 'Visita guiada de 1.5 horas',
        createdAt: new Date().toISOString()
      },
      {
        id: this.generateId(),
        tripId: tripId,
        day: 2, // Segundo día del viaje
        title: 'Almuerzo en Can Solé',
        time: '14:00',
        placeId: places[2].id, // ID del restaurante
        notes: 'Reserva confirmada',
        createdAt: new Date().toISOString()
      }
    ];
    
    this.data.activities.push(...activities);
    
    // Guardar los datos de ejemplo
    this.saveData();
  },
  
  // CRUD para viajes
  
  // Obtener todos los viajes
  getTrips: function() {
    return this.data.trips;
  },
  
  // Obtener un viaje por ID
  getTripById: function(id) {
    return this.data.trips.find(trip => trip.id === id);
  },
  
  // Crear un nuevo viaje
  createTrip: function(tripData) {
    const newTrip = {
      id: this.generateId(),
      ...tripData,
      createdAt: new Date().toISOString()
    };
    
    this.data.trips.push(newTrip);
    this.saveData();
    
    return newTrip;
  },
  
  // Actualizar un viaje existente
  updateTrip: function(id, tripData) {
    const tripIndex = this.data.trips.findIndex(trip => trip.id === id);
    
    if (tripIndex === -1) {
      throw new Error(`Trip with id ${id} not found`);
    }
    
    const updatedTrip = {
      ...this.data.trips[tripIndex],
      ...tripData,
      updatedAt: new Date().toISOString()
    };
    
    this.data.trips[tripIndex] = updatedTrip;
    this.saveData();
    
    return updatedTrip;
  },
  
  // Eliminar un viaje
  deleteTrip: function(id) {
    const tripIndex = this.data.trips.findIndex(trip => trip.id === id);
    
    if (tripIndex === -1) {
      throw new Error(`Trip with id ${id} not found`);
    }
    
    // Eliminar el viaje
    this.data.trips.splice(tripIndex, 1);
    
    // Eliminar lugares, gastos y actividades asociados al viaje
    this.data.places = this.data.places.filter(place => place.tripId !== id);
    this.data.expenses = this.data.expenses.filter(expense => expense.tripId !== id);
    this.data.activities = this.data.activities.filter(activity => activity.tripId !== id);
    
    this.saveData();
    
    return true;
  },
  
  // CRUD para lugares
  
  // Obtener lugares de un viaje
  getTripPlaces: function(tripId) {
    return this.data.places.filter(place => place.tripId === tripId);
  },
  
  // Obtener un lugar por ID
  getPlaceById: function(id) {
    return this.data.places.find(place => place.id === id);
  },
  
  // Crear un nuevo lugar
  createPlace: function(placeData) {
    const newPlace = {
      id: this.generateId(),
      ...placeData,
      createdAt: new Date().toISOString()
    };
    
    this.data.places.push(newPlace);
    this.saveData();
    
    return newPlace;
  },
  
  // Actualizar un lugar existente
  updatePlace: function(id, placeData) {
    const placeIndex = this.data.places.findIndex(place => place.id === id);
    
    if (placeIndex === -1) {
      throw new Error(`Place with id ${id} not found`);
    }
    
    const updatedPlace = {
      ...this.data.places[placeIndex],
      ...placeData,
      updatedAt: new Date().toISOString()
    };
    
    this.data.places[placeIndex] = updatedPlace;
    this.saveData();
    
    return updatedPlace;
  },
  
  // Eliminar un lugar
  deletePlace: function(id) {
    const placeIndex = this.data.places.findIndex(place => place.id === id);
    
    if (placeIndex === -1) {
      throw new Error(`Place with id ${id} not found`);
    }
    
    // Eliminar el lugar
    this.data.places.splice(placeIndex, 1);
    
    // Eliminar actividades asociadas al lugar
    this.data.activities = this.data.activities.filter(activity => activity.placeId !== id);
    
    this.saveData();
    
    return true;
  },
  
  // CRUD para gastos
  
  // Obtener gastos de un viaje
  getTripExpenses: function(tripId) {
    return this.data.expenses.filter(expense => expense.tripId === tripId);
  },
  
  // Obtener un gasto por ID
  getExpenseById: function(id) {
    return this.data.expenses.find(expense => expense.id === id);
  },
  
  // Crear un nuevo gasto
  createExpense: function(expenseData) {
    const newExpense = {
      id: this.generateId(),
      ...expenseData,
      createdAt: new Date().toISOString()
    };
    
    this.data.expenses.push(newExpense);
    this.saveData();
    
    return newExpense;
  },
  
  // Actualizar un gasto existente
  updateExpense: function(id, expenseData) {
    const expenseIndex = this.data.expenses.findIndex(expense => expense.id === id);
    
    if (expenseIndex === -1) {
      throw new Error(`Expense with id ${id} not found`);
    }
    
    const updatedExpense = {
      ...this.data.expenses[expenseIndex],
      ...expenseData,
      updatedAt: new Date().toISOString()
    };
    
    this.data.expenses[expenseIndex] = updatedExpense;
    this.saveData();
    
    return updatedExpense;
  },
  
  // Eliminar un gasto
  deleteExpense: function(id) {
    const expenseIndex = this.data.expenses.findIndex(expense => expense.id === id);
    
    if (expenseIndex === -1) {
      throw new Error(`Expense with id ${id} not found`);
    }
    
    // Eliminar el gasto
    this.data.expenses.splice(expenseIndex, 1);
    this.saveData();
    
    return true;
  },
  
  // CRUD para actividades
  
  // Obtener actividades de un viaje
  getTripActivities: function(tripId) {
    return this.data.activities.filter(activity => activity.tripId === tripId);
  },
  
  // Obtener actividades por día
  getTripActivitiesByDay: function(tripId, day) {
    return this.data.activities.filter(
      activity => activity.tripId === tripId && activity.day === day
    );
  },
  
  // Obtener una actividad por ID
  getActivityById: function(id) {
    return this.data.activities.find(activity => activity.id === id);
  },
  
  // Crear una nueva actividad
  createActivity: function(activityData) {
    const newActivity = {
      id: this.generateId(),
      ...activityData,
      createdAt: new Date().toISOString()
    };
    
    this.data.activities.push(newActivity);
    this.saveData();
    
    return newActivity;
  },
  
  // Actualizar una actividad existente
  updateActivity: function(id, activityData) {
    const activityIndex = this.data.activities.findIndex(activity => activity.id === id);
    
    if (activityIndex === -1) {
      throw new Error(`Activity with id ${id} not found`);
    }
    
    const updatedActivity = {
      ...this.data.activities[activityIndex],
      ...activityData,
      updatedAt: new Date().toISOString()
    };
    
    this.data.activities[activityIndex] = updatedActivity;
    this.saveData();
    
    return updatedActivity;
  },
  
  // Eliminar una actividad
  deleteActivity: function(id) {
    const activityIndex = this.data.activities.findIndex(activity => activity.id === id);
    
    if (activityIndex === -1) {
      throw new Error(`Activity with id ${id} not found`);
    }
    
    // Eliminar la actividad
    this.data.activities.splice(activityIndex, 1);
    this.saveData();
    
    return true;
  },
  
  // Utilidades
  
  // Generar un ID único
  generateId: function() {
    return Date.now().toString(36) + Math.random().toString(36).substring(2);
  },
  
  // Exportar todos los datos
  exportData: function() {
    return {
      trips: this.data.trips,
      places: this.data.places,
      expenses: this.data.expenses,
      activities: this.data.activities,
      exportDate: new Date().toISOString()
    };
  },
  
  // Importar datos
  importData: function(data) {
    try {
      // Validar datos básicos
      if (!data.trips || !data.places || !data.expenses || !data.activities) {
        throw new Error('Invalid data format');
      }
      
      // Actualizar datos
      this.data.trips = data.trips;
      this.data.places = data.places;
      this.data.expenses = data.expenses;
      this.data.activities = data.activities;
      
      // Guardar en localStorage
      this.saveData();
      
      return true;
    } catch (error) {
      console.error('Error importing data:', error);
      return false;
    }
  }
};
