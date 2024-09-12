const $ = el => document.querySelector(el);
const $$ = els => document.querySelectorAll(els);

const imagesInput = $('#images-input');
const itemsSection = $('.selector-items');
const resetButton = $('#reset-tier-button');
const saveButton = $('#save-tier-button');

let draggedElement = null;
let sourceContainer = null;
let progressItemSelected = null;
const levels = $$('.tier .tier-level');

/**
 * Funcion para el momento en el que el objeto arrastrado este sobre el espacio a dejar.
 * @param {Event} event - evento al realizar un drag sobre el item/espacio/seccion arrastrado.
 */
const handleDragOver = (event) => {
    event.preventDefault();
    console.log('handleDragOver: ');
    
    const { currentTarget } = event;
    if (sourceContainer === currentTarget) return;
    
    currentTarget.classList.add('drag-over');
    
    const dragPreview = $('.drag-preview');
    
    if(draggedElement && !dragPreview){
        const previewElement = draggedElement.cloneNode(true);
        previewElement.classList.add('drag-preview');
        currentTarget.appendChild(previewElement);
    }
}

/**
 * Funcion para el momento en el que el objeto arrastrado este fuera el espacio a dejar.
 * @param {Event} event - evento al realizar un drag fuera el item/espacio/seccion arrastrado.
 */
const handleDragLeave = (event) => {
    event.preventDefault();
    console.log('handleDragLeave: ');
    
    const { currentTarget } = event;
    currentTarget.classList.remove('drag-over');
    currentTarget.classList.remove('drag-files');
    currentTarget.querySelector('.drag-preview')?.remove();
}

const changeProgressBarItem = (currentTarget) => {
    if(!currentTarget) return;

    const countImg = currentTarget.querySelectorAll('.item-image').length;
    const countAllImg = document.querySelectorAll('article .item-image').length;
    const progressItemId = currentTarget.getAttribute('progress-bar');
    const progressItem = document.getElementById(progressItemId);

    if(progressItem){
        const progressBar = progressItem.querySelector('progress');
        const progressCount = progressItem.querySelector('#count');
        const progressPercent = progressItem.querySelector('#percent');
    
        let percent = (countImg*100)/countAllImg;
        progressBar.value = percent;
        progressCount.innerText = `(${countImg})`;
        progressPercent.innerText = `${percent}%`;
    }
}

/**
 * Funcion para el momento en el que el objeto cae en el espacio.
 * @param {Event} event - evento al realizar el drop en el item/espacio/seccion arrastrado.
 */
const handleDrop = (event) => {
    event.preventDefault();
    console.log('handleDrop: ');
    
    const { currentTarget, dataTransfer } = event;
    
    if(sourceContainer && draggedElement) {
        sourceContainer.removeChild(draggedElement);
    }

    if(draggedElement) {
        const src = dataTransfer.getData('text/plain');
        const imgElement = createItem(src);
        currentTarget.appendChild(imgElement);
    }

    currentTarget.classList.remove('drag-over');
    currentTarget.querySelector('.drag-preview')?.remove();
    console.log('progressItemSelected: ',progressItemSelected);
    
    changeProgressBarItem(currentTarget);
    changeProgressBarItem(progressItemSelected);
}

/**
 * Funcion para el momento en el que el objeto arrastrado este sobre el espacio a dejar.
 * @param {Event} event - evento al realizar un drag sobre el item/espacio/seccion arrastrado.
 */
const handleDragOverFromDesktop = (event) => {
    event.preventDefault();
    
    const { currentTarget, dataTransfer } = event;
    if (sourceContainer === currentTarget) return;
    
    if(dataTransfer.types.includes('Files')){
        currentTarget.classList.add('drag-files');
    }
}

/**
 * Funcion para el momento en el que el objeto cae en el espacio.
 * @param {Event} event - evento al realizar el drop en el item/espacio/seccion arrastrado.
 */
const handleDropFromDesktop = (event) => {
    event.preventDefault();
    
    const { currentTarget, dataTransfer } = event;
    
    if(dataTransfer.types.includes('Files')){
        currentTarget.classList.remove('drag-files');
        const { files } = dataTransfer;
        useFilesToCreateItems(files);
    }
}

levels.forEach(level => {
    level.addEventListener('dragover', handleDragOver);
    level.addEventListener('dragleave', handleDragLeave);
    level.addEventListener('drop', handleDrop);
})

itemsSection.addEventListener('dragover', handleDragOver);
itemsSection.addEventListener('drop', handleDrop);
itemsSection.addEventListener('dragleave', handleDragLeave);
itemsSection.addEventListener('dragover', handleDragOverFromDesktop);
itemsSection.addEventListener('drop', handleDropFromDesktop);

/**
 * Funcion para el momento en el que inicia el arrastre.
 * @param {Event} event - evento al realizar el inicio del drag.
 */
const handleDragStart = (event) => {
    draggedElement = event.target;
    sourceContainer = draggedElement.parentNode;
    event.dataTransfer.setData('text/plain', draggedElement.src);
    
    progressItemSelected = (sourceContainer.hasAttribute('progress-bar'))? sourceContainer: null;
}

/**
 * Funcion para el momento en el que termina el arrastre.
 * @param {Event} event - evento al realizar el fin del drag.
 */
const handleDragEnd = (event) => {
    draggedElement = null;
    sourceContainer = null;
}

/**
 * Funcion para crear el item.
 * @param {string} src - ruta del archivo.
 */
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

/**
 * Funcion para crear el item apartir de archivos.
 * @param {Object} files - ruta del archivo.
 */
const useFilesToCreateItems = (files) => {
    if (draggedElement) return;

    if(files && files.length > 0){
        Array.from(files).forEach(file => {
            const reader = new FileReader();
    
            reader.onload = (eventReader) => {
                createItem(eventReader.target.result);
            }
    
            reader.readAsDataURL(file);
        })
    }
}

imagesInput,addEventListener('change', (event) => {
    const { files } = event.target;
    useFilesToCreateItems(files);
})

resetButton.addEventListener('click', () => {
    const items = $$('.tier .item-image');

    items.forEach(item => {
        item.remove();
        itemsSection.appendChild(item);
    })
})

saveButton.addEventListener('click', () => {
    const tierContainer = $('.tier');
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    import('https://cdn.jsdelivr.net/npm/html2canvas-pro@1.5.8/+esm')
    .then(({ default: html2canvas }) => {
        html2canvas(tierContainer).then(canvas => {
            ctx.drawImage(canvas, 0, 0)
            const imgURL = canvas.toDataURL('image/png')

            const downloadLink = document.createElement('a')
            downloadLink.download = 'tier.png'
            downloadLink.href = imgURL
            downloadLink.click()
        })
    })
})