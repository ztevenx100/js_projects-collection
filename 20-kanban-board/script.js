// Variables para almacenar las tareas y un contador para IDs únicos
let tasks = [];
let taskIdCounter = 0;
let customTags = []; // Array para almacenar las etiquetas personalizadas
// Variables para filtros
let currentSearchTerm = '';
let currentPriorityFilter = '';
let currentTagFilter = '';
let currentDueDateFilter = '';
let currentSortOption = ''; // Variable para el ordenamiento

// Elementos del DOM que utilizaremos con frecuencia
const taskForm = document.getElementById('task-form');
const taskTitle = document.getElementById('task-title');
const taskDescription = document.getElementById('task-description');
const taskPriority = document.getElementById('task-priority');
const taskDueDate = document.getElementById('task-due-date');
const todoList = document.getElementById('todo');
const progressList = document.getElementById('progress');
const doneList = document.getElementById('done');
// Elementos para filtros y búsqueda
const searchInput = document.getElementById('search-task');
const searchBtn = document.getElementById('search-btn');
const filterPriority = document.getElementById('filter-priority');
const filterTag = document.getElementById('filter-tag');
const filterDueDate = document.getElementById('filter-due-date');
const sortTasks = document.getElementById('sort-tasks');
const clearFiltersBtn = document.getElementById('clear-filters');
// Elementos para etiquetas personalizadas
const customTagInput = document.getElementById('custom-tag');
const addCustomTagBtn = document.getElementById('add-custom-tag');

// Función para inicializar la aplicación
function init() {
  // Cargar tareas desde localStorage si existen
  loadTasksFromLocalStorage();
  
  // Cargar etiquetas personalizadas desde localStorage
  loadCustomTagsFromLocalStorage();
  
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
  filterTag.addEventListener('change', applyFilters);
  filterDueDate.addEventListener('change', applyFilters);
  sortTasks.addEventListener('change', applyFilters);
  clearFiltersBtn.addEventListener('click', clearFilters);
  
  // Event listener para añadir etiquetas personalizadas
  addCustomTagBtn.addEventListener('click', addCustomTag);
  customTagInput.addEventListener('keyup', (e) => {
    if (e.key === 'Enter') {
      addCustomTag();
    }
  });
  
  // Renderizar las tareas iniciales
  renderTasks();
}

// Función para añadir una nueva tarea
function addTask(event) {
  event.preventDefault();
  
  // Recoger las etiquetas seleccionadas
  const selectedTags = Array.from(document.querySelectorAll('input[name="task-tag"]:checked'))
    .map(checkbox => checkbox.value);
  
  // Crear un objeto con los datos de la tarea
  const task = {
    id: taskIdCounter++,
    title: taskTitle.value,
    description: taskDescription.value,
    priority: taskPriority.value,
    dueDate: taskDueDate.value, // Obtener la fecha de vencimiento
    tags: selectedTags,
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
  
  // Obtener la fecha actual para los filtros de fecha
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Normalizar la hora para comparar solo fechas
  
  // Calcular fecha de una semana desde hoy
  const oneWeekFromToday = new Date(today);
  oneWeekFromToday.setDate(today.getDate() + 7);
  
  // Filtrar las tareas según los criterios actuales
  const filteredTasks = tasks.filter(task => {
    // Filtro de búsqueda por título o descripción
    const matchesSearch = currentSearchTerm === '' || 
      task.title.toLowerCase().includes(currentSearchTerm.toLowerCase()) || 
      task.description.toLowerCase().includes(currentSearchTerm.toLowerCase());
    
    // Búsqueda por etiquetas (si existen)
    const matchesTags = currentSearchTerm === '' || 
      (task.tags && task.tags.some(tag => tag.toLowerCase().includes(currentSearchTerm.toLowerCase())));
    
    // Filtro por prioridad
    const matchesPriority = currentPriorityFilter === '' || task.priority === currentPriorityFilter;
    
    // Filtro por etiqueta
    const matchesTagFilter = currentTagFilter === '' || 
      (task.tags && task.tags.includes(currentTagFilter));
    
    // Filtro por fecha de vencimiento
    let matchesDueDate = true;
    if (currentDueDateFilter !== '') {
      if (currentDueDateFilter === 'no-date') {
        // Tareas sin fecha de vencimiento
        matchesDueDate = !task.dueDate;
      } else if (task.dueDate) {
        const dueDate = new Date(task.dueDate);
        
        switch (currentDueDateFilter) {
          case 'overdue':
            // Tareas vencidas (fecha anterior a hoy y no completadas)
            matchesDueDate = dueDate < today && task.status !== 'done';
            break;
          case 'today':
            // Tareas que vencen hoy
            matchesDueDate = 
              dueDate.getFullYear() === today.getFullYear() && 
              dueDate.getMonth() === today.getMonth() && 
              dueDate.getDate() === today.getDate();
            break;
          case 'week':
            // Tareas que vencen esta semana (entre mañana y 7 días)
            const tomorrow = new Date(today);
            tomorrow.setDate(today.getDate() + 1);
            matchesDueDate = dueDate >= tomorrow && dueDate <= oneWeekFromToday;
            break;
          case 'future':
            // Tareas que vencen después de una semana
            matchesDueDate = dueDate > oneWeekFromToday;
            break;
        }
      } else {
        // Si estamos filtrando por fecha pero la tarea no tiene fecha
        matchesDueDate = false;
      }
    }
    
    return (matchesSearch || matchesTags) && matchesPriority && matchesTagFilter && matchesDueDate;
  });
  
  // Ordenar las tareas filtradas según la opción actual de ordenamiento
  let sortedTasks = [...filteredTasks]; // Hacer una copia del array filtrado
  if (currentSortOption === 'priority') {
    // Ordenar por prioridad (alta, media, baja)
    const priorityOrder = { alta: 1, media: 2, baja: 3 };
    sortedTasks.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
  } else if (currentSortOption === 'title') {
    // Ordenar alfabéticamente por título
    sortedTasks.sort((a, b) => a.title.localeCompare(b.title));
  } else if (currentSortOption === 'date') {
    // Ordenar por fecha de creación (más reciente primero)
    sortedTasks.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  } else if (currentSortOption === 'dueDate') {
    // Ordenar por fecha de vencimiento (primero las que vencen antes)
    sortedTasks.sort((a, b) => {
      // Si una tarea no tiene fecha de vencimiento, va al final
      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;
      
      // Comparar fechas de vencimiento
      return new Date(a.dueDate) - new Date(b.dueDate);
    });
  } else if (currentSortOption === 'tags') {
    // Ordenar por etiquetas (primero tareas con etiquetas, luego alfabéticamente por la primera etiqueta)
    sortedTasks.sort((a, b) => {
      // Si una tarea no tiene etiquetas y la otra sí, la que tiene etiquetas va primero
      if (!a.tags || a.tags.length === 0) return 1;
      if (!b.tags || b.tags.length === 0) return -1;
      
      // Si ambas tienen etiquetas, comparar la primera etiqueta alfabéticamente
      return a.tags[0].localeCompare(b.tags[0]);
    });
  }
  
  // Renderizar cada tarea ordenada en su columna correspondiente
  sortedTasks.forEach(task => {
    renderTask(task);
  });
  
  // Mostrar mensaje si no hay tareas que coincidan con los filtros
  if (sortedTasks.length === 0 && (currentSearchTerm !== '' || currentPriorityFilter !== '' || currentTagFilter !== '' || currentDueDateFilter !== '')) {
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
  
  // Verificar el estado de la fecha de vencimiento y aplicar estilos
  let dueDateHTML = '';
  if (task.dueDate) {
    const dueDate = new Date(task.dueDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Normalizar la hora para comparar solo fechas
    
    // Formatear la fecha para mostrarla
    const formattedDate = formatDate(dueDate);
    
    // Comprobar si la tarea está vencida o próxima a vencer
    const timeDiff = dueDate - today;
    const daysDiff = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
    
    if (daysDiff < 0 && task.status !== 'done') {
      // Tarea vencida (y no está en la columna "Hecho")
      dueDateHTML = `<div class="due-date overdue"><span class="due-date-icon">⚠️</span> Vencida: ${formattedDate}</div>`;
      taskCard.classList.add('overdue-card');
    } else if (daysDiff <= 2 && task.status !== 'done') {
      // Tarea que vence pronto (en menos de 3 días y no está en la columna "Hecho")
      dueDateHTML = `<div class="due-date due-soon"><span class="due-date-icon">⏰</span> Vence: ${formattedDate}</div>`;
      taskCard.classList.add('due-soon-card');
    } else {
      // Tarea con fecha normal
      dueDateHTML = `<div class="due-date"><span class="due-date-icon">📅</span> Vence: ${formattedDate}</div>`;
    }
  }
  
  // Generar HTML para las etiquetas si existen
  let tagsHTML = '';
  if (task.tags && task.tags.length > 0) {
    tagsHTML = '<div class="task-tags">';
    task.tags.forEach(tag => {
      const tagText = tag.charAt(0).toUpperCase() + tag.slice(1);
      tagsHTML += `<span class="task-tag tag-${tag}">${tagText}</span>`;
    });
    tagsHTML += '</div>';
  }
  
  // HTML de la tarjeta
  taskCard.innerHTML = `
    <h3>${task.title}</h3>
    <p>${task.description}</p>
    <span class="task-priority priority-${task.priority}">${priorityText}</span>
    ${dueDateHTML}
    ${tagsHTML}
    <button class="delete-task" onclick="deleteTask(${task.id})">✕</button>
  `;
  
  // Añadir la tarjeta a la columna correspondiente
  document.getElementById(task.status).appendChild(taskCard);
}

// Función auxiliar para formatear la fecha en formato dd/mm/yyyy
function formatDate(date) {
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
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
  currentTagFilter = filterTag.value;
  currentDueDateFilter = filterDueDate.value;
  currentSortOption = sortTasks.value; // Obtener la opción de ordenamiento actual
  
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
  currentTagFilter = '';
  currentDueDateFilter = '';
  currentSortOption = '';
  
  searchInput.value = '';
  filterPriority.value = '';
  filterTag.value = '';
  filterDueDate.value = '';
  sortTasks.value = '';
  
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
    
    // Comprobar si hay etiquetas y si alguna coincide con la búsqueda
    let tagMatch = false;
    const tagElements = card.querySelectorAll('.task-tag');
    if (tagElements.length > 0) {
      tagElements.forEach(tagEl => {
        if (tagEl.textContent.toLowerCase().includes(term)) {
          tagMatch = true;
        }
      });
    }
    
    if (title.includes(term) || description.includes(term) || tagMatch) {
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

// Función para añadir una etiqueta personalizada
function addCustomTag() {
  const newTag = customTagInput.value.trim();
  
  // Validar que no esté vacío y no exista ya
  if (newTag && !customTags.includes(newTag)) {
    // Crear un ID para la etiqueta (sin espacios, todo en minúsculas)
    const tagId = newTag.toLowerCase().replace(/\s+/g, '-');
    
    // Añadir la etiqueta al array
    customTags.push(tagId);
    
    // Guardar en localStorage
    saveCustomTagsToLocalStorage();
    
    // Crear elemento para la nueva etiqueta
    createCustomTagElement(tagId, newTag);
    
    // Añadir la etiqueta al filtro
    addTagToFilter(tagId, newTag);
    
    // Limpiar el input
    customTagInput.value = '';
  } else if (customTags.includes(newTag.toLowerCase().replace(/\s+/g, '-'))) {
    alert('Esta etiqueta ya existe');
  }
}

// Función para crear el elemento HTML para una etiqueta personalizada
function createCustomTagElement(tagId, tagName) {
  const tagOptions = document.querySelector('.tag-options');
  const customTagInput = document.querySelector('.custom-tag-input');
  
  // Crear el elemento label
  const tagLabel = document.createElement('label');
  tagLabel.className = 'tag-option';
  
  // Crear el checkbox
  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.name = 'task-tag';
  checkbox.value = tagId;
  
  // Crear el span para el texto y estilo
  const span = document.createElement('span');
  span.className = 'tag-badge tag-custom';
  span.textContent = tagName;
  
  // Combinar todo
  tagLabel.appendChild(checkbox);
  tagLabel.appendChild(span);
  
  // Insertar antes del input de crear etiquetas
  tagOptions.insertBefore(tagLabel, customTagInput);
}

// Función para guardar las etiquetas personalizadas en localStorage
function saveCustomTagsToLocalStorage() {
  localStorage.setItem('kanbanCustomTags', JSON.stringify(customTags));
}

// Función para cargar las etiquetas personalizadas desde localStorage
function loadCustomTagsFromLocalStorage() {
  const savedTags = localStorage.getItem('kanbanCustomTags');
  
  if (savedTags) {
    customTags = JSON.parse(savedTags);
    
    // Renderizar las etiquetas personalizadas
    customTags.forEach(tag => {
      // Convertir el ID de la etiqueta a un nombre presentable
      const tagName = tag.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
      createCustomTagElement(tag, tagName);
      
      // Añadir la etiqueta al filtro de etiquetas
      addTagToFilter(tag, tagName);
    });
  }
}

// Función para añadir una etiqueta al selector de filtro
function addTagToFilter(tagId, tagName) {
  const option = document.createElement('option');
  option.value = tagId;
  option.textContent = tagName;
  filterTag.appendChild(option);
}

// Inicializar la aplicación cuando el DOM esté completamente cargado
document.addEventListener('DOMContentLoaded', init);
