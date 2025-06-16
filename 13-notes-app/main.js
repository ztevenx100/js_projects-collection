// Elementos del DOM
const notesList = document.getElementById('notes-grid');
const categoryList = document.getElementById('category-list');
const searchInput = document.getElementById('search-input');
const clearSearchBtn = document.getElementById('clear-search');
const newCategoryInput = document.getElementById('new-category');
const addCategoryBtn = document.getElementById('add-category');
const addNoteBtn = document.getElementById('add-note');
const deleteAllBtn = document.getElementById('delete-all');
const backToNotesBtn = document.getElementById('back-to-notes');
const noteDetailSection = document.getElementById('note-detail');
const detailTitle = document.getElementById('detail-title');
const detailCategory = document.getElementById('detail-category');
const detailDate = document.getElementById('detail-date');
const detailContent = document.getElementById('detail-content');
const editNoteBtn = document.getElementById('edit-note');
const deleteNoteBtn = document.getElementById('delete-note');
const noteModal = document.getElementById('note-modal');
const modalTitle = document.getElementById('modal-title');
const closeModalBtn = document.getElementById('close-modal');
const noteForm = document.getElementById('note-form');
const noteTitleInput = document.getElementById('note-title');
const noteCategorySelect = document.getElementById('note-category');
const noteContentInput = document.getElementById('note-content');
const cancelFormBtn = document.getElementById('cancel-form');
const confirmModal = document.getElementById('confirm-modal');
const confirmMessage = document.getElementById('confirm-message');
const cancelConfirmBtn = document.getElementById('cancel-confirm');
const confirmActionBtn = document.getElementById('confirm-action');

// Estado de la aplicación
let notes = [];
let categories = ['work', 'personal', 'ideas', 'tasks'];
let selectedCategory = 'all';
let editingNoteId = null;
let viewingNoteId = null;
let searchTerm = '';
let confirmCallback = null;

// Inicializar la aplicación
function initApp() {
    loadNotesFromLocalStorage();
    loadCategoriesFromLocalStorage();
    renderNotes();
    renderCategories();
    
    // Si no hay notas, mostrar estado vacío
    if (notes.length === 0) {
        showEmptyState();
    }
}

// Funciones de almacenamiento local
function loadNotesFromLocalStorage() {
    const storedNotes = localStorage.getItem('notes');
    if (storedNotes) {
        notes = JSON.parse(storedNotes);
    }
}

function loadCategoriesFromLocalStorage() {
    const storedCategories = localStorage.getItem('categories');
    if (storedCategories) {
        categories = JSON.parse(storedCategories);
        updateCategorySelect();
    }
}

function saveNotesToLocalStorage() {
    localStorage.setItem('notes', JSON.stringify(notes));
}

function saveCategoriesToLocalStorage() {
    localStorage.setItem('categories', JSON.stringify(categories));
}

// Funciones de visualización
function renderNotes() {
    notesList.innerHTML = '';
    
    // Filtrar por categoría y término de búsqueda
    const filteredNotes = notes.filter(note => {
        const categoryMatch = selectedCategory === 'all' || note.category === selectedCategory;
        const searchMatch = searchTerm === '' || 
            note.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
            note.content.toLowerCase().includes(searchTerm.toLowerCase());
        
        return categoryMatch && searchMatch;
    });
    
    if (filteredNotes.length === 0) {
        showEmptyState();
    } else {
        filteredNotes.forEach(note => {
            const noteCard = createNoteCard(note);
            notesList.appendChild(noteCard);
        });
    }
}

function createNoteCard(note) {
    const card = document.createElement('div');
    card.className = `note-card ${note.category}`;
    card.setAttribute('data-id', note.id);
    
    const formattedDate = formatDate(note.createdAt);
    
    card.innerHTML = `
        <h3>${note.title}</h3>
        <div class="note-meta">
            <span class="category-badge ${note.category}">${note.category}</span>
            <span class="note-date">${formattedDate}</span>
        </div>
        <div class="note-preview">${getPreviewContent(note.content)}</div>
        <div class="note-fade"></div>
    `;
    
    card.addEventListener('click', () => {
        viewNote(note.id);
    });
    
    return card;
}

function getPreviewContent(content) {
    // Eliminar marcado markdown para la vista previa
    let preview = content
        .replace(/#+\s+/g, '') // Quitar encabezados
        .replace(/\*\*(.*?)\*\*/g, '$1') // Quitar negritas
        .replace(/\*(.*?)\*/g, '$1') // Quitar cursivas
        .replace(/\[(.*?)\]\(.*?\)/g, '$1') // Quitar links
        .replace(/```[\s\S]*?```/g, 'Código...') // Reemplazar bloques de código
        .replace(/`(.*?)`/g, '$1'); // Quitar código inline
    
    return preview;
}

function showEmptyState() {
    const emptyState = document.createElement('div');
    emptyState.className = 'empty-state';
    
    const message = searchTerm || selectedCategory !== 'all' 
        ? 'No se encontraron notas con los filtros actuales.'
        : 'No hay notas. ¡Crea tu primera nota!';
    
    emptyState.innerHTML = `
        <h3>${message}</h3>
        ${(!searchTerm && selectedCategory === 'all') ? 
            `<button id="empty-add-note" class="primary-btn">Crear Nota</button>` : 
            ''}
    `;
    
    notesList.appendChild(emptyState);
    
    const emptyAddNoteBtn = document.getElementById('empty-add-note');
    if (emptyAddNoteBtn) {
        emptyAddNoteBtn.addEventListener('click', openAddNoteModal);
    }
}

function renderCategories() {
    // Mantener los elementos "Todas" siempre presente
    const allCategoryItem = categoryList.querySelector('[data-category="all"]');
    categoryList.innerHTML = '';
    categoryList.appendChild(allCategoryItem);
    
    // Renderizar categorías personalizadas
    categories.forEach(category => {
        const li = document.createElement('li');
        li.setAttribute('data-category', category);
        li.textContent = capitalizeFirstLetter(category);
        
        if (category === selectedCategory) {
            li.classList.add('active');
        }
        
        li.addEventListener('click', () => {
            selectCategory(category);
        });
        
        categoryList.appendChild(li);
    });
    
    // Activar la categoría "Todas" si está seleccionada
    if (selectedCategory === 'all') {
        allCategoryItem.classList.add('active');
    } else {
        allCategoryItem.classList.remove('active');
    }
}

function updateCategorySelect() {
    noteCategorySelect.innerHTML = '';
    
    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = capitalizeFirstLetter(category);
        noteCategorySelect.appendChild(option);
    });
}

function selectCategory(category) {
    selectedCategory = category;
    
    // Actualizar UI
    document.querySelectorAll('#category-list li').forEach(li => {
        if (li.getAttribute('data-category') === category) {
            li.classList.add('active');
        } else {
            li.classList.remove('active');
        }
    });
    
    renderNotes();
}

// Funciones para gestionar notas
function addNote(note) {
    notes.unshift({
        id: generateId(),
        createdAt: new Date().toISOString(),
        ...note
    });
    
    saveNotesToLocalStorage();
    renderNotes();
}

function updateNote(id, updatedNote) {
    const index = notes.findIndex(note => note.id === id);
    if (index !== -1) {
        notes[index] = {
            ...notes[index],
            ...updatedNote,
            updatedAt: new Date().toISOString()
        };
        
        saveNotesToLocalStorage();
        renderNotes();
    }
}

function deleteNote(id) {
    notes = notes.filter(note => note.id !== id);
    saveNotesToLocalStorage();
    renderNotes();
}

function deleteAllNotes() {
    notes = [];
    saveNotesToLocalStorage();
    renderNotes();
}

function viewNote(id) {
    viewingNoteId = id;
    const note = notes.find(note => note.id === id);
    
    if (note) {
        // Ocultar la lista y mostrar el detalle
        notesList.classList.add('hidden');
        noteDetailSection.classList.remove('hidden');
        
        // Actualizar la UI con los detalles de la nota
        detailTitle.textContent = note.title;
        detailCategory.textContent = note.category;
        detailCategory.className = `category-badge ${note.category}`;
        
        const formattedDate = formatDate(note.createdAt);
        detailDate.textContent = note.updatedAt ? `Actualizada: ${formatDate(note.updatedAt)}` : `Creada: ${formattedDate}`;
        
        // Renderizar el markdown
        detailContent.innerHTML = marked.parse(note.content);
    }
}

// Funciones auxiliares
function generateId() {
    return Date.now().toString();
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('es-ES', { 
        day: '2-digit', 
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    }).format(date);
}

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

// Gestión de modales
function openAddNoteModal() {
    modalTitle.textContent = 'Nueva Nota';
    clearForm();
    noteModal.classList.remove('hidden');
    editingNoteId = null;
}

function openEditNoteModal(id) {
    const note = notes.find(note => note.id === id);
    if (note) {
        modalTitle.textContent = 'Editar Nota';
        noteTitleInput.value = note.title;
        noteCategorySelect.value = note.category;
        noteContentInput.value = note.content;
        noteModal.classList.remove('hidden');
        editingNoteId = id;
    }
}

function closeNoteModal() {
    noteModal.classList.add('hidden');
    clearForm();
}

function clearForm() {
    noteForm.reset();
}

function showConfirmModal(message, onConfirm) {
    confirmMessage.textContent = message;
    confirmCallback = onConfirm;
    confirmModal.classList.remove('hidden');
}

function closeConfirmModal() {
    confirmModal.classList.add('hidden');
    confirmCallback = null;
}

// Event listeners
window.addEventListener('DOMContentLoaded', initApp);

// Categorías
addCategoryBtn.addEventListener('click', () => {
    const newCategory = newCategoryInput.value.trim().toLowerCase();
    
    if (newCategory && !categories.includes(newCategory)) {
        categories.push(newCategory);
        saveCategoriesToLocalStorage();
        renderCategories();
        updateCategorySelect();
        newCategoryInput.value = '';
    }
});

// Búsqueda
searchInput.addEventListener('input', (e) => {
    searchTerm = e.target.value.trim();
    renderNotes();
});

clearSearchBtn.addEventListener('click', () => {
    searchInput.value = '';
    searchTerm = '';
    renderNotes();
});

// Gestión de notas
addNoteBtn.addEventListener('click', openAddNoteModal);

backToNotesBtn.addEventListener('click', () => {
    noteDetailSection.classList.add('hidden');
    notesList.classList.remove('hidden');
    viewingNoteId = null;
});

editNoteBtn.addEventListener('click', () => {
    if (viewingNoteId) {
        openEditNoteModal(viewingNoteId);
    }
});

deleteNoteBtn.addEventListener('click', () => {
    if (viewingNoteId) {
        showConfirmModal('¿Estás seguro de que quieres eliminar esta nota?', () => {
            deleteNote(viewingNoteId);
            noteDetailSection.classList.add('hidden');
            notesList.classList.remove('hidden');
            viewingNoteId = null;
        });
    }
});

deleteAllBtn.addEventListener('click', () => {
    if (notes.length > 0) {
        showConfirmModal('¿Estás seguro de que quieres eliminar todas las notas?', () => {
            deleteAllNotes();
        });
    }
});

// Modal y formularios
closeModalBtn.addEventListener('click', closeNoteModal);
cancelFormBtn.addEventListener('click', closeNoteModal);

noteForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const noteData = {
        title: noteTitleInput.value.trim(),
        category: noteCategorySelect.value,
        content: noteContentInput.value
    };
    
    if (editingNoteId) {
        updateNote(editingNoteId, noteData);
        
        // Si estamos viendo la nota siendo editada, actualizar la vista
        if (viewingNoteId === editingNoteId) {
            viewNote(editingNoteId);
        }
    } else {
        addNote(noteData);
    }
    
    closeNoteModal();
});

// Modales de confirmación
cancelConfirmBtn.addEventListener('click', closeConfirmModal);

confirmActionBtn.addEventListener('click', () => {
    if (confirmCallback) {
        confirmCallback();
    }
    closeConfirmModal();
});
