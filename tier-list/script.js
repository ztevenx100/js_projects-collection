const $ = el => document.querySelector(el);
const $$ = els => document.querySelectorAll(els);

const imagesInput = $('#images-input');
const itemsSection = $('.selector-items');

let draggedElement = null;
let sourceContainer = null;
const levels = $$('.tier .level');

const handleDrop = (event) => {
    event.preventDefault();
    
    const { currentTarget, dataTransfer } = event;
    
    if(sourceContainer && draggedElement) {
        sourceContainer.removeChild(draggedElement);
    }

    if(draggedElement) {
        const src = dataTransfer.getData('text/plain');
        const imgElement = createItem(src);
        currentTarget.appendChild(imgElement);
    }
}

const handleDragOver = (event) => {
    event.preventDefault();
    
    const { currentTarget } = event;
    if (sourceContainer === currentTarget) return;

    currentTarget.classList.add('drag-over');
}

const handleDragLeave = (event) => {
    event.preventDefault();
    
}

levels.forEach(level => {
    level.addEventListener('dragover', handleDragOver);
    level.addEventListener('drop', handleDrop);
    level.addEventListener('dragleave', handleDragLeave);
})

const handleDragStart = (event) => {
    draggedElement = event.target;
    sourceContainer = draggedElement.parentNode;
    event.dataTransfer.setData('text/plain', draggedElement.src);
}

const handleDragEnd = (event) => {
    draggedElement = null;
    sourceContainer = null;
}

const createItem = (src) =>{
    const imgElement = document.createElement('img');
    imgElement.src = src;
    imgElement.className = 'item-image';
    
    imgElement.draggable = true;
    imgElement.addEventListener('dragstart', handleDragStart);
    imgElement.addEventListener('dragend', handleDragEnd);
    
    itemsSection.appendChild(imgElement);
    return imgElement;
}

imagesInput,addEventListener('change', (event) => {
    const [file] = event.target.files;

    if(file){
        const reader = new FileReader();

        reader.onload = (eventReader) => {
            createItem(eventReader.target.result);
        }

        reader.readAsDataURL(file);
    }
})
