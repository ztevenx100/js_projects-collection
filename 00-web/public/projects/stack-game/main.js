// UTILITIES
const $ = selector => document.querySelector(selector);
const $$ = selector => document.querySelectorAll(selector);

// CONSTANTS
const canvas = $('canvas');
const context = canvas.getContext('2d');

const score = $('#score');

// CONSTANTS
const MODES = {
  FALL: 'fall',
  BOUNCE: 'bounce',
  GAMEOVER: 'gameover'
}
const INITIAL_BOX_WIDTH = 200;
const INITIAL_BOX_Y = 600;

const BOX_HEIGHT = 50;
const INITIAL_Y_SPEED = 5;
const INITIAL_X_SPEED = 2;
const TOLERANCE = 1;

// STATE
let boxes = [];
let debris = { x: 0, y: 0, width: 0 };
let scrollCounter, cameraY, current, mode, xSpeed, ySpeed;
let isRunning = true;

/**
 * Crea un color basado en el paso actual del juego.
 *
 * Esta función genera un color aleatorio en formato RGB para el paso dado. Si el paso es 0,
 * retorna el color blanco. Para otros pasos, genera valores aleatorios para los componentes
 * rojo, verde y azul del color.
 *
 * @param {number} step - El número de paso actual del juego.
 * @returns {string} - Un color en formato `rgb(r, g, b)`.
 */
function createStepColor(step) {
  if (step === 0) return 'white';

  const red = Math.floor(Math.random() * 255);
  const green = Math.floor(Math.random() * 255);
  const blue = Math.floor(Math.random() * 255);

  return `rgb(${red}, ${green}, ${blue})`;
}

/**
 * Actualiza la posición de la cámara en función del contador de desplazamiento.
 *
 * Esta función mueve la cámara hacia arriba (incrementando `cameraY`) si `scrollCounter` es mayor que 0,
 * y reduce el valor de `scrollCounter` en 1 por cada actualización. El desplazamiento se detiene cuando
 * `scrollCounter` llega a 0.
 */
function updateCamera() {
  if (scrollCounter > 0) {
    cameraY++;
    scrollCounter--;
  }
}

/**
 * Inicializa el estado del juego configurando las variables y creando la primera caja.
 *
 * Esta función establece los valores iniciales para las cajas, el modo de juego, las velocidades,
 * el contador de desplazamiento, y la posición de la cámara. También invoca la función `createNewBox`
 * para agregar una nueva caja al juego.
 */
function initializeGameState() {
  boxes = [{
    x: (canvas.width / 2) - (INITIAL_BOX_WIDTH / 2),
    y: 200,
    width: INITIAL_BOX_WIDTH,
    color: 'white'
  }]

  debris = { x: 0, y: 0, width: 0 };
  current = 1;
  mode = MODES.BOUNCE;
  xSpeed = INITIAL_X_SPEED;
  ySpeed = INITIAL_Y_SPEED;
  scrollCounter = 0;
  cameraY = 0;

  createNewBox();
}

/**
 * Reinicia el juego inicializando el estado y redibujando el lienzo.
 */
function restart() {
  initializeGameState();
  isRunning = true;
  draw();
}

/**
 * Dibuja el estado actual del juego y actualiza la lógica de movimiento y colisiones.
 *
 * Esta función dibuja el fondo, las cajas y los escombros. Dependiendo del modo de juego,
 * gestiona el movimiento de rebote o caída. También actualiza la posición de los escombros y la cámara.
 * Finalmente, utiliza `requestAnimationFrame` para continuar el ciclo de dibujo.
 *
 * @returns {void} - Si el modo de juego es "GAMEOVER", la función se detiene.
 */
function draw() {
  if (!isRunning) return;
  if (mode === MODES.GAMEOVER) return;

  drawBackground();
  drawBoxes();
  drawDebris();

  if (mode === MODES.BOUNCE) {
    moveAndDetectCollision();
  } else if (mode === MODES.FALL) {
    updateFallMode();
  }

  debris.y -= ySpeed;
  updateCamera();

  window.requestAnimationFrame(draw);
}

/**
 * Dibuja el fondo del lienzo con un color semitransparente.
 * @returns {void}
 */
function drawBackground() {
  context.fillStyle = 'rgba(0, 0, 0, 0.5)';
  context.fillRect(0, 0, canvas.width, canvas.height);
}

function drawDebris() {
  const { x, y, width } = debris
  const newY = INITIAL_BOX_Y - y + cameraY

  context.fillStyle = 'red'
  context.fillRect(x, newY, width, BOX_HEIGHT)
}

/**
 * Dibuja todas las cajas en el lienzo, ajustando su posición en función de la cámara.
 * Esta función recorre todas las cajas en el arreglo `boxes`, ajusta su posición vertical según la posición de la cámara,
 * y las dibuja en el lienzo con una sombra aplicada. Después de dibujar cada caja, se elimina la sombra para el próximo dibujado.
 *
 * @returns {void}
 */
function drawBoxes() {
  boxes.forEach((box) => {
    const { x, y, width, color } = box;
    const newY = INITIAL_BOX_Y - y + cameraY;

    // Agregar sombra
    context.shadowColor = 'rgba(0, 0, 0, 0.3)';
    context.shadowBlur = 10;

    context.fillStyle = color
    context.fillRect(x, newY, width, BOX_HEIGHT);

    // Eliminar sombra para el próximo dibujado
    context.shadowBlur = 0;
  })
}

function createNewBox() {
  boxes[current] = {
    x: 0,
    y: (current + 10) * BOX_HEIGHT,
    width: boxes[current - 1].width,
    color: createStepColor(current)
  }
}

function createNewDebris(difference) {
  const currentBox = boxes[current]
  const previousBox = boxes[current - 1]

  const debrisX = currentBox.x > previousBox.x
    ? currentBox.x + currentBox.width
    : currentBox.x

  debris = {
    x: debrisX,
    y: currentBox.y,
    width: difference
  }
}

/**
 * Actualiza la posición vertical de la caja actual en el modo de caída y verifica el aterrizaje.
 *
 * @returns {void}
 */
function updateFallMode() {
  const currentBox = boxes[current]
  currentBox.y -= ySpeed

  const positionPreviousBox = boxes[current - 1].y + BOX_HEIGHT

  if (currentBox.y === positionPreviousBox) {
    handleBoxLanding()
  }
}

/**
 * Ajusta la posición y el ancho de la caja actual en función de la diferencia con la caja anterior.
 *
 * @param {number} difference - La diferencia en la posición horizontal entre la caja actual y la caja anterior.
 * @returns {void}
 */
function adjustCurrentBox(difference) {
  const currentBox = boxes[current]
  const previousBox = boxes[current - 1]

  if (currentBox.x > previousBox.x) {
    currentBox.width -= difference
  } else {
    currentBox.width += difference
    currentBox.x = previousBox.x
  }
}

/**
 * Cambia el juego al modo "GAMEOVER" y muestra el mensaje de fin de juego.
 *
 * @returns {void}
 */
function gameOver() {
  mode = MODES.GAMEOVER;
  isRunning = false;

  context.clearRect(0, 0, canvas.width, canvas.height);
  context.fillStyle = 'rgba(255, 0, 0, 0.5)';
  context.fillRect(0, 0, canvas.width, canvas.height);

  context.font = 'bold 20px Arial';
  context.fillStyle = 'white';
  context.textAlign = 'center';
  context.fillText(
    'Game Over',
    canvas.width / 2,
    canvas.height / 2
  );
}

/**
 * Gestiona la lógica cuando una caja aterriza en otra.
 * Esta función compara la posición de la caja actual con la caja anterior para determinar si el jugador falló.
 * 
 * @returns {void}
 */
function handleBoxLanding() {
  const currentBox = boxes[current];
  const previousBox = boxes[current - 1];

  const difference = currentBox.x - previousBox.x;

  if (Math.abs(difference) >= currentBox.width + TOLERANCE) {
    gameOver();
    return;
  }

  adjustCurrentBox(difference);
  createNewDebris(difference);

  xSpeed += (xSpeed > 0 ? 1 : -1) + (current / 50); // Incrementa la dificultad gradualmente
  //ySpeed += (current / 10); // Aumenta la velocidad de caída con la puntuación
  current++;
  scrollCounter = BOX_HEIGHT;
  mode = MODES.BOUNCE;

  score.textContent = current - 1 ;

  createNewBox();
}

/**
 * Mueve la caja actual y detecta colisiones con los bordes del lienzo.
 * @returns {void}
 */
function moveAndDetectCollision() {
  const currentBox = boxes[current]
  currentBox.x += xSpeed

  const isMovingRight = xSpeed > 0
  const isMovingLeft = xSpeed < 0

  const hasHitRightSide =
    currentBox.x + currentBox.width > canvas.width

  const hasHitLeftSide = currentBox.x < 0

  if (
    (isMovingRight && hasHitRightSide) ||
    (isMovingLeft && hasHitLeftSide)
  ) {
    xSpeed = -xSpeed
  }
}

document.addEventListener('keydown', (event) => {
  if (event.key === ' ' && mode === MODES.BOUNCE) {
    mode = MODES.FALL
  }
})

canvas.onpointerdown = () => {
  if (mode === MODES.GAMEOVER) {
    restart()
  } else if (mode === MODES.BOUNCE) {
    mode = MODES.FALL
  }
}

restart()