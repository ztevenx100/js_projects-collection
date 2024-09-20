// CONSTANTS
const MODES = {
  DRAW: 'draw',
  ERASE: 'erase',
  RECTANGLE: 'rectangle',
  ELLIPSE: 'ellipse',
  STAR: 'star',
  FILL: 'fill',
  PICKER: 'picker'
}

// UTILITIES
const $ = selector => document.querySelector(selector);
const $$ = selector => document.querySelectorAll(selector);

// ELEMENTS
const $canvas = $('#canvas');
const $colorPicker = $('#color-picker');
const $clearBtn = $('#clear-btn');
const $drawBtn = $('#draw-btn');
const $eraseBtn = $('#erase-btn');
const $rectangleBtn = $('#rectangle-btn');
const $ellipseBtn = $('#ellipse-btn');
const $starBtn = $('#star-btn');
const $fillBtn = $('#fill-btn');
const $pickerBtn = $('#picker-btn');

const ctx = $canvas.getContext('2d');
const containerCanvas = $canvas.parentElement;
$canvas.width = containerCanvas.offsetWidth;
$canvas.height = containerCanvas.offsetHeight;

// STATE
let isDrawing = false;
let isShiftPressed = false;
let startX, startY;
let lastX = 0;
let lastY = 0;
let mode = MODES.DRAW;
let imageData;

// EVENTS
$canvas.addEventListener('mousedown', startDrawing);
$canvas.addEventListener('mousemove', draw);
$canvas.addEventListener('mouseup', stopDrawing);
$canvas.addEventListener('mouseleave', stopDrawing);

$colorPicker.addEventListener('change', handleChangeColor);
$clearBtn.addEventListener('click', clearCanvas);

document.addEventListener('keydown', handleKeyDown);
document.addEventListener('keyup', handleKeyUp);


$pickerBtn.addEventListener('click', () => {
  setMode(MODES.PICKER);
})

$eraseBtn.addEventListener('click', () => {
  setMode(MODES.ERASE);
})

$rectangleBtn.addEventListener('click', () => {
  setMode(MODES.RECTANGLE);
})

$ellipseBtn.addEventListener('click', () => {
  setMode(MODES.ELLIPSE);
})

$starBtn.addEventListener('click', () => {
  setMode(MODES.STAR);
})

$fillBtn.addEventListener('click', () => {
  setMode(MODES.FILL);
})

$drawBtn.addEventListener('click', () => {
  setMode(MODES.DRAW);
})


// METHODS
/**
 * Inicia el proceso de dibujo en el lienzo cuando se detecta un evento de dibujo.
 * Esta función activa el modo de dibujo, captura las coordenadas iniciales donde comienza el trazo y guarda el estado actual del lienzo. Es utilizada para registrar el punto de inicio
 * del dibujo y para almacenar los datos de imagen actuales.
 *
 * @param {MouseEvent} event - El evento de ratón que contiene las coordenadas del clic en el lienzo.
 */
function startDrawing(event) {
  isDrawing = true

  const { offsetX, offsetY } = event;

  // guardar las coordenadas iniciales
  [startX, startY] = [offsetX, offsetY];
  [lastX, lastY] = [offsetX, offsetY];

  imageData = ctx.getImageData(
    0, 0, $canvas.width, $canvas.height
  );
}

/**
 * Dibuja en el lienzo dependiendo del modo seleccionado (dibujar, borrar o rectángulo).
 * Esta función maneja el proceso de dibujo continuo en el lienzo. Dibuja segun el modo.
 *
 * @param {MouseEvent} event - El evento de ratón que contiene las coordenadas del movimiento en el lienzo.
 */
function draw(event) {
  if (!isDrawing) return;

  const { offsetX, offsetY } = event;

  if (mode === MODES.DRAW || mode === MODES.ERASE) {
    // comenzar un trazado
    ctx.beginPath();

    // mover el trazado a las coordenadas actuales
    ctx.moveTo(lastX, lastY);

    // dibujar una línea entre coordenadas actuales y las nuevas
    ctx.lineTo(offsetX, offsetY);

    ctx.stroke();

    // actualizar la última coordenada utilizada
    [lastX, lastY] = [offsetX, offsetY];

    return;
  }

  if (mode === MODES.RECTANGLE) {
    ctx.putImageData(imageData, 0, 0);

    // startX -> coordenada inicial del click
    let width = offsetX - startX
    let height = offsetY - startY

    if (isShiftPressed) {
      const sideLength = Math.min(
        Math.abs(width),
        Math.abs(height)
      )

      width = width > 0 ? sideLength : -sideLength
      height = height > 0 ? sideLength : -sideLength
    }

    ctx.beginPath()
    ctx.rect(startX, startY, width, height)
    ctx.stroke()
    return
  }

  // Modo de dibujar elipses o círculos
  if (mode === MODES.ELLIPSE) {
    ctx.putImageData(imageData, 0, 0);
    let radiusX = (offsetX - startX) / 2;
    let radiusY = (offsetY - startY) / 2;
    const centerX = startX + radiusX;
    const centerY = startY + radiusY;

    if (isShiftPressed) {
      // Si Shift está presionado, hacer que las elipses sean círculos
      const radius = Math.min(Math.abs(radiusX), Math.abs(radiusY));
      radiusX = radius;
      radiusY = radius;
    }

    ctx.beginPath();
    ctx.ellipse(centerX, centerY, Math.abs(radiusX), Math.abs(radiusY), 0, 0, Math.PI * 2);
    ctx.stroke();
    return;
  }

  if (mode === MODES.STAR) {
    ctx.putImageData(imageData, 0, 0);

    // Calcular el tamaño de la estrella
    const radius = Math.sqrt(Math.pow(offsetX - startX, 2) + Math.pow(offsetY - startY, 2));

    // Dibujar la estrella con 5 puntas (puedes cambiar el número de puntas)
    drawStar(ctx, startX, startY, 5, radius, radius / 2);

    if (isShiftPressed) {
      ctx.fill();
    } else {
      ctx.stroke();
    }

    return;
  }

  if (mode === MODES.FILL) {
    // Llamar a la función para rellenar la región
    fill(offsetX, offsetY);
    return;
  }

}

/**
 * Dibuja una estrella en el lienzo.
 * 
 * @param {CanvasRenderingContext2D} ctx - El contexto del lienzo.
 * @param {number} cx - La coordenada X del centro de la estrella.
 * @param {number} cy - La coordenada Y del centro de la estrella.
 * @param {number} spikes - El número de puntas de la estrella.
 * @param {number} outerRadius - El radio exterior de la estrella.
 * @param {number} innerRadius - El radio interior de la estrella (parte entre las puntas).
 */
function drawStar(ctx, cx, cy, spikes, outerRadius, innerRadius) {
  let rot = Math.PI / 2 * 3;
  let x = cx;
  let y = cy;
  const step = Math.PI / spikes;

  ctx.beginPath();
  ctx.moveTo(cx, cy - outerRadius);

  for (let i = 0; i < spikes; i++) {
    x = cx + Math.cos(rot) * outerRadius;
    y = cy + Math.sin(rot) * outerRadius;
    ctx.lineTo(x, y);
    rot += step;

    x = cx + Math.cos(rot) * innerRadius;
    y = cy + Math.sin(rot) * innerRadius;
    ctx.lineTo(x, y);
    rot += step;
  }

  ctx.lineTo(cx, cy - outerRadius);
  ctx.closePath();
}

/**
 * Función que realiza el relleno (flood fill) en la posición clicada.
 * 
 * @param {number} x - La posición X donde se hizo clic.
 * @param {number} y - La posición Y donde se hizo clic.
 */
function fill(x, y) {
  const imageData = ctx.getImageData(0, 0, $canvas.width, $canvas.height);
  const pixelStack = [[x, y]];
  const startColor = getPixelColor(imageData, x, y);
  const fillColor = hexToRgba($colorPicker.value); // Color deseado para rellenar

  // Verifica si el color inicial es igual al color de relleno
  if (colorsMatch(startColor, fillColor)) return;

  while (pixelStack.length > 0) {
    const [px, py] = pixelStack.pop();

    const pixelPos = (py * $canvas.width + px) * 4;
    const currentColor = [
      imageData.data[pixelPos],
      imageData.data[pixelPos + 1],
      imageData.data[pixelPos + 2],
      imageData.data[pixelPos + 3]
    ];

    if (colorsMatch(currentColor, startColor)) {
      // Cambiar el color del píxel a fillColor
      setPixelColor(imageData, px, py, fillColor);

      // Agregar los píxeles adyacentes al stack
      pixelStack.push([px + 1, py]);
      pixelStack.push([px - 1, py]);
      pixelStack.push([px, py + 1]);
      pixelStack.push([px, py - 1]);
    }
  }

  // Actualizar el canvas con la imagen modificada
  ctx.putImageData(imageData, 0, 0);
}

/**
 * Obtiene el color de un píxel en el lienzo.
 *
 * @param {ImageData} imageData - Los datos de la imagen del canvas.
 * @param {number} x - La posición X del píxel.
 * @param {number} y - La posición Y del píxel.
 * @returns {number[]} Un arreglo RGBA con el color del píxel.
 */
function getPixelColor(imageData, x, y) {
  const pixelPos = (y * $canvas.width + x) * 4;
  return [
    imageData.data[pixelPos],      // R
    imageData.data[pixelPos + 1],  // G
    imageData.data[pixelPos + 2],  // B
    imageData.data[pixelPos + 3]   // A
  ];
}

/**
 * Establece el color de un píxel en el lienzo.
 *
 * @param {ImageData} imageData - Los datos de la imagen del canvas.
 * @param {number} x - La posición X del píxel.
 * @param {number} y - La posición Y del píxel.
 * @param {number[]} color - Un arreglo RGBA con el nuevo color del píxel.
 */
function setPixelColor(imageData, x, y, color) {
  const pixelPos = (y * $canvas.width + x) * 4;
  imageData.data[pixelPos] = color[0];     // R
  imageData.data[pixelPos + 1] = color[1]; // G
  imageData.data[pixelPos + 2] = color[2]; // B
  imageData.data[pixelPos + 3] = color[3]; // A
}

/**
 * Convierte un valor hexadecimal a un array de RGBA.
 *
 * @param {string} hex - El color en formato hexadecimal.
 * @returns {number[]} Un arreglo RGBA con el color convertido.
 */
function hexToRgba(hex) {
  const bigint = parseInt(hex.slice(1), 16);
  return [
    (bigint >> 16) & 255,  // R
    (bigint >> 8) & 255,   // G
    bigint & 255,          // B
    255                    // A (completamente opaco)
  ];
}

/**
 * Compara dos colores RGBA para ver si coinciden.
 *
 * @param {number[]} color1 - El primer color RGBA.
 * @param {number[]} color2 - El segundo color RGBA.
 * @returns {boolean} Verdadero si los colores coinciden, falso de lo contrario.
 */
function colorsMatch(color1, color2) {
  return (
    color1[0] === color2[0] &&
    color1[1] === color2[1] &&
    color1[2] === color2[2] &&
    color1[3] === color2[3]
  );
}

function stopDrawing(event) {
  isDrawing = false;
}

function handleChangeColor() {
  const { value } = $colorPicker;
  ctx.strokeStyle = value;
}

function clearCanvas() {
  ctx.clearRect(0, 0, $canvas.width, $canvas.height);
}

/**
 * Cambia el modo de operación del lienzo (dibujar, borrar, rectángulo o selector de color).
 *
 * Esta función actualiza el modo actual del lienzo, ajusta la interfaz de usuario para reflejar el modo activo, y modifica las propiedades del contexto del lienzo (`ctx`) como el tipo de operación de composición y el ancho del trazo.
 * También maneja la selección de color cuando el modo es "PICKER".
 *
 * @param {string} newMode - El nuevo modo que se establecerá. Debe ser uno de los valores de `MODES`.
 * @returns {Promise<void>} - Retorna una promesa que se resuelve cuando el modo es "PICKER" y se completa la operación de selección de color.
 */
async function setMode(newMode) {
  let previousMode = mode;
  mode = newMode;
  // para limpiar el botón activo actual
  $('button.active')?.classList.remove('active');

  if (mode === MODES.DRAW) {
    $drawBtn.classList.add('active');
    $canvas.style.cursor = 'crosshair';
    ctx.globalCompositeOperation = 'source-over';
    ctx.lineWidth = 2;
    return;
  }

  if (mode === MODES.RECTANGLE) {
    $rectangleBtn.classList.add('active');
    $canvas.style.cursor = 'nw-resize';
    ctx.globalCompositeOperation = 'source-over';
    ctx.lineWidth = 2;
    return;
  }

  if (mode === MODES.ELLIPSE) {
    $ellipseBtn.classList.add('active');
    $canvas.style.cursor = 'nw-resize';
    ctx.globalCompositeOperation = 'source-over';
    ctx.lineWidth = 2;
    return;
  }

  if (mode === MODES.STAR) {
    $starBtn.classList.add('active');
    $canvas.style.cursor = 'nw-resize';
    ctx.globalCompositeOperation = 'source-over';
    ctx.lineWidth = 2;
    return;
  }

  if (mode === MODES.FILL) {
    $fillBtn.classList.add('active');
    $canvas.style.cursor = 'url("/assets/img/png/cursors/fill.png")16 16, auto';
    ctx.globalCompositeOperation = 'source-over';
    //ctx.lineWidth = 2;
    return;
  }

  if (mode === MODES.ERASE) {
    $eraseBtn.classList.add('active')
    $canvas.style.cursor = 'url("/assets/img/png/cursors/erase.png") 0 24, auto';
    ctx.globalCompositeOperation = 'destination-out';
    ctx.lineWidth = 20;
    return;
  }

  if (mode === MODES.PICKER) {
    $pickerBtn.classList.add('active');
    const eyeDropper = new window.EyeDropper();

    try {
      const result = await eyeDropper.open();
      const { sRGBHex } = result;
      ctx.strokeStyle = sRGBHex;
      $colorPicker.value = sRGBHex;
      setMode(previousMode);
    } catch (e) {
      // si ha habido un error o el usuario no ha recuperado ningún color
    }

    return;
  }
}

function handleKeyDown({ key }) {
  isShiftPressed = key === 'Shift';
}

function handleKeyUp({ key }) {
  if (key === 'Shift') isShiftPressed = false;
}


// INIT
setMode(MODES.DRAW);

// Show Picker if browser has support
if (typeof window.EyeDropper !== 'undefined') {
  $pickerBtn.removeAttribute('disabled');
}