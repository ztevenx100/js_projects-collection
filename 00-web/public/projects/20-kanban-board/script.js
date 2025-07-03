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
// Variables para estadísticas
let statsVisible = false;
// Variables para subtareas
let subtaskIdCounter = 0;
let currentSubtasks = []; // Subtareas para la tarea actual en el formulario

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
// Elementos para subtareas
const subtasksList = document.getElementById('subtasks-list');
const subtaskText = document.getElementById('subtask-text');
const addSubtaskBtn = document.getElementById('add-subtask');
// Elementos para estadísticas
const toggleStatsBtn = document.getElementById('toggle-stats');
const statsContent = document.querySelector('.stats-content');

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
  
  // Event listener para añadir subtareas
  addSubtaskBtn.addEventListener('click', addSubtask);
  subtaskText.addEventListener('keyup', (e) => {
    if (e.key === 'Enter') {
      addSubtask();
    }
  });
  
  // Event listener para estadísticas
  toggleStatsBtn.addEventListener('click', toggleStats);
  
  // Cargar y mostrar estadísticas
  updateStats();
  
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
    createdAt: new Date().toISOString(),
    subtasks: currentSubtasks.length > 0 ? [...currentSubtasks] : [] // Añadir las subtareas
  };
  
  // Añadir la tarea al array de tareas
  tasks.push(task);
  
  // Guardar en localStorage
  saveTasksToLocalStorage();
  
  // Renderizar la nueva tarea
  renderTask(task);
  
  // Actualizar estadísticas
  updateStats();
  
  // Desmarcar todos los checkboxes de etiquetas
  document.querySelectorAll('input[name="task-tag"]:checked').forEach(checkbox => {
    checkbox.checked = false;
  });
  
  // Resetear el formulario
  taskForm.reset();
  
  // Limpiar las subtareas
  clearSubtasks();
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
  
  // Actualizar estadísticas cuando cambian las tareas visibles
  updateStats();
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
    
    // Formatear la fecha para mostrar
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
  
  // Generar HTML para las subtareas si existen
  let subtasksHTML = '';
  if (task.subtasks && task.subtasks.length > 0) {
    // Calcular progreso de subtareas
    const totalSubtasks = task.subtasks.length;
    const completedSubtasks = task.subtasks.filter(subtask => subtask.completed).length;
    const completionPercentage = totalSubtasks > 0 ? Math.round((completedSubtasks / totalSubtasks) * 100) : 0;
    
    // Construir HTML para las subtareas
    subtasksHTML = `
      <div class="subtasks-progress">
        <div class="subtasks-header">
          <span>Subtareas (${completedSubtasks}/${totalSubtasks})</span>
          <button class="subtasks-toggle" onclick="toggleSubtasksList(${task.id})">🔽</button>
        </div>
        <div class="subtasks-progress-bar">
          <div class="subtasks-progress-fill" style="width: ${completionPercentage}%;"></div>
        </div>
        <ul class="subtasks-checklist" id="subtasks-${task.id}">
          ${task.subtasks.map(subtask => `
            <li class="subtask-check ${subtask.completed ? 'completed' : ''}">
              <input type="checkbox" id="check-${task.id}-${subtask.id}" 
                ${subtask.completed ? 'checked' : ''} 
                onchange="toggleSubtask(${task.id}, ${subtask.id})">
              <label for="check-${task.id}-${subtask.id}">${subtask.text}</label>
            </li>
          `).join('')}
        </ul>
      </div>
    `;
  }

  // HTML de la tarjeta
  taskCard.innerHTML = `
    <h3>${task.title}</h3>
    <p>${task.description}</p>
    <span class="task-priority priority-${task.priority}">${priorityText}</span>
    ${dueDateHTML}
    ${tagsHTML}
    ${subtasksHTML}
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
  
  // Actualizar estadísticas
  updateStats();
  
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
      const oldStatus = task.status;
      const newStatus = targetColumn.id;
      task.status = newStatus;
      
      // Si la tarea se completó (se movió a la columna "done")
      if (newStatus === 'done' && oldStatus !== 'done') {
        task.completedAt = new Date().toISOString();
      }
      // Si la tarea se movió desde "done" a otra columna, eliminar la fecha de finalización
      else if (oldStatus === 'done' && newStatus !== 'done') {
        delete task.completedAt;
      }
      
      saveTasksToLocalStorage();
      
      // Actualizar estadísticas
      updateStats();
    }
  }
}

// Funciones para localStorage
function saveTasksToLocalStorage() {
  localStorage.setItem('kanbanTasks', JSON.stringify(tasks));
  localStorage.setItem('taskIdCounter', taskIdCounter);
  localStorage.setItem('subtaskIdCounter', subtaskIdCounter);
}

function loadTasksFromLocalStorage() {
  const savedTasks = localStorage.getItem('kanbanTasks');
  const savedCounter = localStorage.getItem('taskIdCounter');
  const savedSubtaskCounter = localStorage.getItem('subtaskIdCounter');
  
  if (savedTasks) {
    tasks = JSON.parse(savedTasks);
  }
  
  if (savedCounter) {
    taskIdCounter = parseInt(savedCounter);
  }
  
  if (savedSubtaskCounter) {
    subtaskIdCounter = parseInt(savedSubtaskCounter);
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

// Función para mostrar/ocultar la sección de estadísticas
function toggleStats() {
  statsVisible = !statsVisible;
  
  if (statsVisible) {
    statsContent.classList.add('open');
    toggleStatsBtn.textContent = '🔼';
    toggleStatsBtn.title = 'Ocultar Estadísticas';
  } else {
    statsContent.classList.remove('open');
    toggleStatsBtn.textContent = '🔽';
    toggleStatsBtn.title = 'Mostrar Estadísticas';
  }
}

// Función para actualizar todas las estadísticas
function updateStats() {
  updateTaskCountStats();
  updatePriorityStats();
  updateDueDateStats();
  updateTagStats();
  updatePerformanceStats();
  updateSubtaskStats();
}

// Actualiza las estadísticas del conteo de tareas
function updateTaskCountStats() {
  const totalTasks = tasks.length;
  const todoTasks = tasks.filter(task => task.status === 'todo').length;
  const progressTasks = tasks.filter(task => task.status === 'progress').length;
  const doneTasks = tasks.filter(task => task.status === 'done').length;
  
  document.getElementById('total-tasks').textContent = totalTasks;
  document.getElementById('todo-tasks').textContent = todoTasks;
  document.getElementById('progress-tasks').textContent = progressTasks;
  document.getElementById('done-tasks').textContent = doneTasks;
}

// Actualiza las estadísticas de prioridad
function updatePriorityStats() {
  const highPriority = tasks.filter(task => task.priority === 'alta').length;
  const mediumPriority = tasks.filter(task => task.priority === 'media').length;
  const lowPriority = tasks.filter(task => task.priority === 'baja').length;
  
  document.getElementById('high-priority').textContent = highPriority;
  document.getElementById('medium-priority').textContent = mediumPriority;
  document.getElementById('low-priority').textContent = lowPriority;
}

// Actualiza las estadísticas de fecha de vencimiento
function updateDueDateStats() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const oneWeekFromToday = new Date(today);
  oneWeekFromToday.setDate(today.getDate() + 7);
  
  // Contar tareas vencidas, hoy, semana y sin fecha
  const overdueTasks = tasks.filter(task => 
    task.dueDate && new Date(task.dueDate) < today && task.status !== 'done'
  ).length;
  
  const todayTasks = tasks.filter(task => {
    if (!task.dueDate) return false;
    const dueDate = new Date(task.dueDate);
    return dueDate.getFullYear() === today.getFullYear() &&
           dueDate.getMonth() === today.getMonth() &&
           dueDate.getDate() === today.getDate();
  }).length;
  
  const weekTasks = tasks.filter(task => {
    if (!task.dueDate) return false;
    const dueDate = new Date(task.dueDate);
    return dueDate > today && dueDate <= oneWeekFromToday;
  }).length;
  
  const noDateTasks = tasks.filter(task => !task.dueDate).length;
  
  document.getElementById('overdue-tasks').textContent = overdueTasks;
  document.getElementById('today-tasks').textContent = todayTasks;
  document.getElementById('week-tasks').textContent = weekTasks;
  document.getElementById('no-date-tasks').textContent = noDateTasks;
}

// Actualiza las estadísticas de etiquetas
function updateTagStats() {
  // Obtener todas las etiquetas usadas
  const tagCounts = {};
  
  // Contar cada etiqueta
  tasks.forEach(task => {
    if (task.tags && task.tags.length > 0) {
      task.tags.forEach(tag => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      });
    }
  });
  
  // Convertir el objeto a un array para ordenarlo
  const tagArray = Object.keys(tagCounts).map(tag => ({
    name: tag,
    count: tagCounts[tag]
  }));
  
  // Ordenar por frecuencia (más usadas primero)
  tagArray.sort((a, b) => b.count - a.count);
  
  // Obtener el elemento donde mostraremos el gráfico
  const tagsChart = document.getElementById('tags-chart');
  tagsChart.innerHTML = '';
  
  // Limitar a las 6 etiquetas más usadas
  const topTags = tagArray.slice(0, 6);
  
  // Si no hay etiquetas, mostrar un mensaje
  if (topTags.length === 0) {
    tagsChart.innerHTML = '<p class="no-data">No hay etiquetas en uso</p>';
    return;
  }
  
  // Encontrar el valor máximo para calcular porcentajes
  const maxCount = Math.max(...topTags.map(tag => tag.count));
  
  // Crear la barra para cada etiqueta
  topTags.forEach(tag => {
    const percentage = (tag.count / maxCount) * 100;
    
    // Formatear el nombre de la etiqueta para mostrar (primera letra mayúscula)
    const displayName = tag.name.charAt(0).toUpperCase() + tag.name.slice(1);
    
    // Crear el elemento HTML de la barra
    const tagBarContainer = document.createElement('div');
    tagBarContainer.className = 'tag-bar-container';
    
    // Nombre de la etiqueta
    const tagNameElement = document.createElement('span');
    tagNameElement.className = 'tag-name';
    tagNameElement.textContent = displayName;
    
    // Barra de progreso
    const tagBarElement = document.createElement('div');
    tagBarElement.className = 'tag-bar';
    tagBarElement.style.width = `${percentage}%`;
    tagBarElement.style.backgroundColor = getTagColor(tag.name);
    
    // Contador
    const tagCountElement = document.createElement('span');
    tagCountElement.className = 'tag-bar-count';
    tagCountElement.textContent = tag.count;
    
    // Ensamblar elementos
    tagBarContainer.appendChild(tagNameElement);
    tagBarContainer.appendChild(tagBarElement);
    tagBarContainer.appendChild(tagCountElement);
    
    tagsChart.appendChild(tagBarContainer);
  });
}

// Obtiene el color de la etiqueta basado en las variables CSS
function getTagColor(tagName) {
  const tags = {
    desarrollo: 'var(--tag-desarrollo)',
    diseño: 'var(--tag-diseño)',
    bug: 'var(--tag-bug)',
    documentación: 'var(--tag-documentación)',
    urgente: 'var(--tag-urgente)',
    bloqueado: 'var(--tag-bloqueado)'
  };
  
  return tags[tagName] || '#607d8b'; // Color por defecto para etiquetas personalizadas
}

// Actualiza las estadísticas de rendimiento
function updatePerformanceStats() {
  // Obtener la fecha actual y hace 7 días
  const today = new Date();
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(today.getDate() - 7);
  
  // Tareas completadas en los últimos 7 días
  const completedInWeek = tasks.filter(task => {
    if (task.status !== 'done') return false;
    
    // Si la tarea no tiene una fecha de finalización, no podemos saber cuándo se completó
    if (!task.completedAt) return false;
    
    const completedDate = new Date(task.completedAt);
    return completedDate >= oneWeekAgo;
  }).length;
  
  // Calcular tiempo promedio de finalización (solo para tareas completadas que tienen fecha de inicio y finalización)
  const completedTasks = tasks.filter(task => 
    task.status === 'done' && task.createdAt && task.completedAt
  );
  
  let avgCompletionTime = 'N/A';
  
  if (completedTasks.length > 0) {
    const totalDays = completedTasks.reduce((sum, task) => {
      const createdDate = new Date(task.createdAt);
      const completedDate = new Date(task.completedAt);
      const days = (completedDate - createdDate) / (1000 * 60 * 60 * 24);
      return sum + days;
    }, 0);
    
    avgCompletionTime = (totalDays / completedTasks.length).toFixed(1) + ' días';
  }
  
  // Calcular tasa de finalización (tareas completadas / tareas totales)
  const totalTasks = tasks.length;
  const completedTasks2 = tasks.filter(task => task.status === 'done').length;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks2 / totalTasks) * 100) : 0;
  
  // Actualizar los elementos en el DOM
  document.getElementById('completed-week').textContent = completedInWeek;
  document.getElementById('avg-completion-time').textContent = avgCompletionTime;
  document.getElementById('completion-rate').textContent = `${completionRate}%`;
}

// Actualiza las estadísticas de subtareas
function updateSubtaskStats() {
  // Contar el total de subtareas y subtareas completadas
  let totalSubtasks = 0;
  let completedSubtasks = 0;
  
  tasks.forEach(task => {
    if (task.subtasks && task.subtasks.length > 0) {
      totalSubtasks += task.subtasks.length;
      completedSubtasks += task.subtasks.filter(subtask => subtask.completed).length;
    }
  });
  
  // Calcular la tasa de finalización
  const completionRate = totalSubtasks > 0 ? Math.round((completedSubtasks / totalSubtasks) * 100) : 0;
  
  // Actualizar el elemento en el DOM
  const subtasksCompletionElement = document.getElementById('subtasks-completion-rate');
  if (subtasksCompletionElement) {
    subtasksCompletionElement.textContent = `${completionRate}%`;
  }
}

// Función para añadir una subtarea al formulario
function addSubtask() {
  const text = subtaskText.value.trim();
  
  if (text) {
    const subtaskId = subtaskIdCounter++;
    
    // Crear objeto de subtarea
    const subtask = {
      id: subtaskId,
      text: text,
      completed: false
    };
    
    // Añadir al array de subtareas actuales
    currentSubtasks.push(subtask);
    
    // Crear el elemento en el DOM
    renderSubtaskInForm(subtask);
    
    // Limpiar el input
    subtaskText.value = '';
  }
}

// Función para renderizar una subtarea en el formulario
function renderSubtaskInForm(subtask) {
  const subtaskElement = document.createElement('div');
  subtaskElement.className = 'subtask-item';
  subtaskElement.dataset.id = subtask.id;
  
  subtaskElement.innerHTML = `
    <input type="text" value="${subtask.text}" readonly>
    <button type="button" onclick="removeSubtask(${subtask.id})">✕</button>
  `;
  
  subtasksList.appendChild(subtaskElement);
}

// Función para eliminar una subtarea del formulario
function removeSubtask(id) {
  // Eliminar del array
  currentSubtasks = currentSubtasks.filter(subtask => subtask.id !== id);
  
  // Eliminar del DOM
  const subtaskElement = document.querySelector(`.subtask-item[data-id="${id}"]`);
  if (subtaskElement) {
    subtaskElement.remove();
  }
}

// Función para limpiar las subtareas del formulario
function clearSubtasks() {
  currentSubtasks = [];
  subtasksList.innerHTML = '';
}

// Función para cambiar el estado de una subtarea (completada o no)
function toggleSubtask(taskId, subtaskId) {
  // Buscar la tarea
  const task = tasks.find(t => t.id === taskId);
  if (!task || !task.subtasks) return;
  
  // Buscar la subtarea
  const subtask = task.subtasks.find(st => st.id === subtaskId);
  if (!subtask) return;
  
  // Cambiar el estado
  subtask.completed = !subtask.completed;
  
  // Actualizar el elemento en el DOM
  const subtaskElement = document.getElementById(`check-${taskId}-${subtaskId}`).parentElement;
  if (subtask.completed) {
    subtaskElement.classList.add('completed');
  } else {
    subtaskElement.classList.remove('completed');
  }
  
  // Actualizar la barra de progreso
  updateSubtasksProgress(taskId);
  
  // Guardar en localStorage
  saveTasksToLocalStorage();
  
  // Actualizar estadísticas
  updateStats();
}

// Función para mostrar u ocultar la lista de subtareas
function toggleSubtasksList(taskId) {
  const subtasksList = document.getElementById(`subtasks-${taskId}`);
  const toggleButton = subtasksList.parentElement.querySelector('.subtasks-toggle');
  
  if (subtasksList.classList.contains('open')) {
    subtasksList.classList.remove('open');
    toggleButton.textContent = '🔽';
  } else {
    subtasksList.classList.add('open');
    toggleButton.textContent = '🔼';
  }
}

// Función para actualizar la barra de progreso de subtareas
function updateSubtasksProgress(taskId) {
  const task = tasks.find(t => t.id === taskId);
  if (!task || !task.subtasks || task.subtasks.length === 0) return;
  
  const totalSubtasks = task.subtasks.length;
  const completedSubtasks = task.subtasks.filter(st => st.completed).length;
  const completionPercentage = totalSubtasks > 0 ? Math.round((completedSubtasks / totalSubtasks) * 100) : 0;
  
  // Actualizar el contador de subtareas
  const headerSpan = document.querySelector(`#subtasks-${taskId}`).parentElement.querySelector('.subtasks-header span');
  headerSpan.textContent = `Subtareas (${completedSubtasks}/${totalSubtasks})`;
  
  // Actualizar la barra de progreso
  const progressFill = document.querySelector(`#subtasks-${taskId}`).parentElement.querySelector('.subtasks-progress-fill');
  progressFill.style.width = `${completionPercentage}%`;
}

// Inicializar la aplicación cuando el DOM esté completamente cargado
document.addEventListener('DOMContentLoaded', init);
