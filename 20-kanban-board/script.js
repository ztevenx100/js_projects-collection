// Variables para almacenar las tareas y un contador para IDs únicos
let tasks = [];
let taskIdCounter = 0;

// Elementos del DOM que utilizaremos con frecuencia
const taskForm = document.getElementById('task-form');
const taskTitle = document.getElementById('task-title');
const taskDescription = document.getElementById('task-description');
const taskPriority = document.getElementById('task-priority');
const todoList = document.getElementById('todo');
const progressList = document.getElementById('progress');
const doneList = document.getElementById('done');

// Función para inicializar la aplicación
function init() {
  // Cargar tareas desde localStorage si existen
  loadTasksFromLocalStorage();
  
  // Event listener para el formulario de tareas
  taskForm.addEventListener('submit', addTask);
  
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
  
  // Renderizar cada tarea en su columna correspondiente
  tasks.forEach(task => {
    renderTask(task);
  });
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

// Inicializar la aplicación cuando el DOM esté completamente cargado
document.addEventListener('DOMContentLoaded', init);
