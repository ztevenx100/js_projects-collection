import { BLOCK_SIZE, PIECES, BOARD_WIDTH, BOARD_HEIGHT, EVENT_MOVEMENTS } from './consts.js';

const canvas = document.querySelector('canvas');
const context = canvas.getContext('2d');
const $score = document.querySelector('span');
//const $section = document.querySelector('section.init-screen');
const audio = new window.Audio('./assets/tetris.mp3');
const btnMusic = document.querySelector('button#music');
const btnStart = document.querySelector('button#start');
let dropCounter = 0;
let lastTime = 0;
let score = 0;
let start = false;
let isPlaying = true;

const board = createBoard(BOARD_WIDTH, BOARD_HEIGHT);

const piece = {
  position: {x:5, y:5},
  shape: [
    [1, 1],
    [1, 1]
  ]
}

canvas.width = BLOCK_SIZE * BOARD_WIDTH;
canvas.height = BLOCK_SIZE * BOARD_HEIGHT;
context.scale(BLOCK_SIZE, BLOCK_SIZE);
btnMusic.onclick = playMusic;
btnStart.onclick = playGame;

// 2. Game loop
function update(time = 0) {
  const deltaTime = time - lastTime;
  lastTime = time;
  dropCounter += deltaTime;

  if (dropCounter > 1000) {
    piece.position.y++;
    dropCounter = 0;
    if (checkCollision()){
      piece.position.y--;
      solidifyPiece();
      removeRows();
    }
  }

  draw();
  window.requestAnimationFrame(update)
}

function draw() {
  context.fillRect(0, 0, canvas.width, canvas.height);
  //context.fillStyle = '#000';
  for (let x = 0; x < canvas.width; x++) {
    for (let y = 0; y < canvas.height; y++) {
      context.fillStyle = (x + y) % 2 === 0 ? '#222' : '#444'; // Alternar colores para una apariencia de cuadrícula
      context.fillRect(x, y, 1, 1);
    }
  }

  board.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value === 1) {
        context.fillStyle = '#ff0';
        context.fillRect(x, y, 1, 1);
      }
    })
  });

  piece.shape.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value) {
        context.fillStyle = '#fff';
        context.fillRect(x + piece.position.x, y + piece.position.y, 1, 1);
      }
    })
  });

  $score.innerText = score;
}

// 3. Board
function createBoard (width, height) {
  return Array(height).fill().map(() => Array(width).fill(0))
}

document.addEventListener('keydown', event => {
  if (event.key === EVENT_MOVEMENTS.LEFT || event.key === EVENT_MOVEMENTS.LEFT_LETTER) {
    piece.position.x--;
    if (checkCollision()) piece.position.x++;
  }

  if (event.key === EVENT_MOVEMENTS.RIGHT || event.key === EVENT_MOVEMENTS.RIGHT_LETTER) {
    piece.position.x++;
    if (checkCollision()) piece.position.x--;
  }

  if (event.key === EVENT_MOVEMENTS.DOWN || event.key === EVENT_MOVEMENTS.DOWN_LETTER) {
    piece.position.y++;
    if (checkCollision()){
      piece.position.y--;
      solidifyPiece();
      removeRows();
    }
  }

  if (event.key === EVENT_MOVEMENTS.ROTATE || event.key === EVENT_MOVEMENTS.ROTATE_LETTER) {
    const rotated = [];

    for (let i = 0; i < piece.shape[0].length; i++) {
      const row = [];
      
      for (let rotateX = piece.shape.length - 1; rotateX >= 0; rotateX--) {
        row.push(piece.shape[rotateX][i]);
      }
      rotated.push(row);
    }

    const previousShape = piece.shape;
    piece.shape = rotated;
    
    if (checkCollision()) piece.shape = previousShape;
    
  }
})

function playGame() {
  update();

  //$section.remove();
  audio.volume = 0.5;
  audio.play();
  audio.loop = true;
  btnMusic.innerText = 'Parar musica';
  isPlaying = true;
}

// 4. Collision
function checkCollision() {
  return piece.shape.find((row, y) => {
    return row.find((value, x) => {
      
      return (
        value !== 0 
        && board[y + piece.position.y]?.[x + piece.position.x] !== 0
      )

    })
  });
}

//5. Solidificar figura
function solidifyPiece() {
  piece.shape.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value === 1) {
        board[y + piece.position.y][x + piece.position.x] = 1;
      }
    })
  });

  // Random piece
  piece.shape = getRandomPiece();
  
  // reset position
  piece.position.x = Math.floor((BOARD_WIDTH / 2) - 2);
  piece.position.y = 0;

  // Game Over
  if (checkCollision()) {
    alert('Game over');
    board.forEach((row) => row.fill(0));
  }
}

// 6. Eliminar linea
function removeRows() {
  const rowsToRemove = [];

  board.forEach((row, y) => {
    if(row.every(value => value ===1)){
      rowsToRemove.push(y);
    }
  });

  rowsToRemove.forEach(y => {
    board.splice(y,1);
    const newRows = Array(BOARD_WIDTH).fill(0);
    board.unshift(newRows);
    score += 10;
  });
}

//7. obtener pieza random
function getRandomPiece() {
  return PIECES[Math.floor(Math.random() * PIECES.length)]
}

function playMusic() {
  
  if (isPlaying) {
    audio.pause();
    btnMusic.innerText = 'Iniciar musica';
  } else {
    audio.play();
    btnMusic.innerText = 'Parar musica';
  }
  
  isPlaying = !isPlaying;
}