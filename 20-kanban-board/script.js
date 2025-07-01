// Variables para almacenar las tareas y un contador para IDs únicos
let tasks = [];
let taskIdCounter = 0;
// Variables para filtros
let currentSearchTerm = '';
let currentPriorityFilter = '';

// Elementos del DOM que utilizaremos con frecuencia
const taskForm = document.getElementById('task-form');
const taskTitle = document.getElementById('task-title');
const taskDescription = document.getElementById('task-description');
const taskPriority = document.getElementById('task-priority');
const todoList = document.getElementById('todo');
const progressList = document.getElementById('progress');
const doneList = document.getElementById('done');
// Elementos para filtros y búsqueda
const searchInput = document.getElementById('search-task');
const searchBtn = document.getElementById('search-btn');
const filterPriority = document.getElementById('filter-priority');
const clearFiltersBtn = document.getElementById('clear-filters');

// Función para inicializar la aplicación
function init() {
  // Cargar tareas desde localStorage si existen
  loadTasksFromLocalStorage();
  
  // Event listener para el formulario de tareas
  taskForm.addEventListener('submit', addTask);
  
  // Event listeners para búsqueda y filtros
  searchBtn.addEventListener('click', applyFilters);
  searchInput.addEventListener('keyup', (e) => {
    if (e.key === 'Enter') {
      applyFilters();
    }
  });
  filterPriority.addEventListener('change', applyFilters);
  clearFiltersBtn.addEventListener('click', clearFilters);
  
  // Renderizar las tareas iniciales
  renderTasks();
}

// Función para añadir una nueva tarea
function addTask(event) {
  event.preventDefault();
  
  // Crear un objeto con los datos de la tarea
  const task = {
    id: taskIdCounter++,
    title: taskTitle.value,
    description: taskDescription.value,
    priority: taskPriority.value,
    status: 'todo',
    createdAt: new Date().toISOString()
  };
  
  // Añadir la tarea al array de tareas
  tasks.push(task);
  
  // Guardar en localStorage
  saveTasksToLocalStorage();
  
  // Renderizar la nueva tarea
  renderTask(task);
  
  // Resetear el formulario
  taskForm.reset();
}

// Función para renderizar todas las tareas
function renderTasks() {
  // Limpiar los contenedores primero
  todoList.innerHTML = '';
  progressList.innerHTML = '';
  doneList.innerHTML = '';
  
  // Filtrar las tareas según los criterios actuales
  const filteredTasks = tasks.filter(task => {
    // Filtro de búsqueda por título o descripción
    const matchesSearch = currentSearchTerm === '' || 
      task.title.toLowerCase().includes(currentSearchTerm.toLowerCase()) || 
      task.description.toLowerCase().includes(currentSearchTerm.toLowerCase());
    
    // Filtro por prioridad
    const matchesPriority = currentPriorityFilter === '' || task.priority === currentPriorityFilter;
    
    return matchesSearch && matchesPriority;
  });
  
  // Renderizar cada tarea filtrada en su columna correspondiente
  filteredTasks.forEach(task => {
    renderTask(task);
  });
  
  // Mostrar mensaje si no hay tareas que coincidan con los filtros
  if (filteredTasks.length === 0 && (currentSearchTerm !== '' || currentPriorityFilter !== '')) {
    showNoTasksMessage();
  }
}

// Función para renderizar una tarea individual
function renderTask(task) {
  // Crear el elemento de la tarjeta
  const taskCard = document.createElement('div');
  taskCard.className = 'task-card';
  taskCard.id = `task-${task.id}`;
  taskCard.draggable = true;
  
  // Configurar los atributos para el drag and drop
  taskCard.setAttribute('ondragstart', 'drag(event)');
  
  // Prioridad formateada para mostrar
  const priorityText = task.priority.charAt(0).toUpperCase() + task.priority.slice(1);
  
  // HTML de la tarjeta
  taskCard.innerHTML = `
    <h3>${task.title}</h3>
    <p>${task.description}</p>
    <span class="task-priority priority-${task.priority}">${priorityText}</span>
    <button class="delete-task" onclick="deleteTask(${task.id})">✕</button>
  `;
  
  // Añadir la tarjeta a la columna correspondiente
  document.getElementById(task.status).appendChild(taskCard);
}

// Función para eliminar una tarea
function deleteTask(id) {
  // Filtrar las tareas para eliminar la que tiene el ID indicado
  tasks = tasks.filter(task => task.id !== id);
  
  // Guardar en localStorage
  saveTasksToLocalStorage();
  
  // Volver a renderizar todas las tareas
  renderTasks();
}

// Funciones para el drag and drop
function allowDrop(event) {
  event.preventDefault();
}

function drag(event) {
  event.dataTransfer.setData("text", event.target.id);
}

function drop(event) {
  event.preventDefault();
  const taskId = event.dataTransfer.getData("text");
  const taskElement = document.getElementById(taskId);
  const targetColumn = event.target.closest('.task-list');
  
  // Si soltamos en una columna válida
  if (targetColumn) {
    targetColumn.appendChild(taskElement);
    
    // Actualizar el estado de la tarea en nuestro array
    const id = parseInt(taskId.split('-')[1]);
    const task = tasks.find(task => task.id === id);
    
    if (task) {
      task.status = targetColumn.id;
      saveTasksToLocalStorage();
    }
  }
}

// Funciones para localStorage
function saveTasksToLocalStorage() {
  localStorage.setItem('kanbanTasks', JSON.stringify(tasks));
  localStorage.setItem('taskIdCounter', taskIdCounter);
}

function loadTasksFromLocalStorage() {
  const savedTasks = localStorage.getItem('kanbanTasks');
  const savedCounter = localStorage.getItem('taskIdCounter');
  
  if (savedTasks) {
    tasks = JSON.parse(savedTasks);
  }
  
  if (savedCounter) {
    taskIdCounter = parseInt(savedCounter);
  }
}

// Función para aplicar filtros de búsqueda y prioridad
function applyFilters() {
  currentSearchTerm = searchInput.value.trim();
  currentPriorityFilter = filterPriority.value;
  
  renderTasks();
  
  // Si hay un término de búsqueda, resaltar las coincidencias
  if (currentSearchTerm !== '') {
    highlightMatchingTasks();
  }
}

// Función para limpiar todos los filtros
function clearFilters() {
  currentSearchTerm = '';
  currentPriorityFilter = '';
  
  searchInput.value = '';
  filterPriority.value = '';
  
  // Eliminar todos los resaltados
  document.querySelectorAll('.highlight-task').forEach(card => {
    card.classList.remove('highlight-task');
  });
  
  renderTasks();
}

// Función para resaltar las tareas que coinciden con la búsqueda
function highlightMatchingTasks() {
  const term = currentSearchTerm.toLowerCase();
  
  document.querySelectorAll('.task-card').forEach(card => {
    const title = card.querySelector('h3').textContent.toLowerCase();
    const description = card.querySelector('p').textContent.toLowerCase();
    
    if (title.includes(term) || description.includes(term)) {
      card.classList.add('highlight-task');
    }
  });
}

// Función para mostrar mensaje cuando no hay tareas que coincidan con los filtros
function showNoTasksMessage() {
  const columns = [todoList, progressList, doneList];
  
  columns.forEach(column => {
    if (column.childElementCount === 0) {
      const messageElement = document.createElement('div');
      messageElement.className = 'no-tasks-message';
      messageElement.textContent = 'No hay tareas que coincidan con los filtros';
      column.appendChild(messageElement);
    }
  });
}

// Inicializar la aplicación cuando el DOM esté completamente cargado
document.addEventListener('DOMContentLoaded', init);
