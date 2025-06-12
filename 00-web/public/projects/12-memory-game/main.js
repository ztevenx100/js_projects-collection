// Elementos del DOM
const memoryBoard = document.getElementById('memory-board');
const startButton = document.getElementById('start-btn');
const resetButton = document.getElementById('reset-btn');
const difficultySelect = document.getElementById('difficulty');
const movesElement = document.getElementById('moves');
const timeElement = document.getElementById('time');
const gameOverModal = document.getElementById('game-over-modal');
const finalMovesElement = document.getElementById('final-moves');
const finalTimeElement = document.getElementById('final-time');
const playAgainButton = document.getElementById('play-again-btn');

// Variables del juego
let gameStarted = false;
let gamePaused = false;
let gameSize = 4; // Tamaño inicial del tablero (4x4)
let cards = [];
let flippedCards = [];
let matchedPairs = 0;
let moves = 0;
let timer = 0;
let timerInterval;

// Emoji que se usarán como pares
const emojis = [
    '🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼',
    '🐨', '🐯', '🦁', '🐮', '🐷', '🐸', '🐵', '🐔',
    '🐧', '🐦', '🦆', '🦉', '🦇', '🐺', '🐗', '🐴',
    '🦄', '🐝', '🐛', '🦋', '🐌', '🐞', '🦟', '🦗',
    '🐢', '🐍', '🦎', '🦖', '🦕', '🐙', '🦑', '🦐',
    '🦞', '🦀', '🐡', '🐠', '🐟', '🐬', '🐳', '🐋',
    '🦈', '🐊', '🐅', '🐆', '🦓', '🦍', '🦧', '🐘',
    '🦛', '🦏', '🐪', '🐫', '🦒', '🦘', '🐃', '🐂'
];

// Event listeners
startButton.addEventListener('click', startGame);
resetButton.addEventListener('click', resetGame);
difficultySelect.addEventListener('change', changeDifficulty);
playAgainButton.addEventListener('click', closeModal);

// Función para iniciar el juego
function startGame() {
    if (gameStarted) return;
    
    gameStarted = true;
    moves = 0;
    matchedPairs = 0;
    timer = 0;
    updateMoves();
    updateTimer();
    
    createBoard();
    
    // Iniciar el temporizador
    timerInterval = setInterval(() => {
        timer++;
        updateTimer();
    }, 1000);
}

// Función para crear el tablero
function createBoard() {
    memoryBoard.innerHTML = '';
    memoryBoard.style.gridTemplateColumns = `repeat(${gameSize}, 1fr)`;
    
    // Determinar cuántas cartas necesitamos (gameSize^2)
    const totalCards = gameSize * gameSize;
    const pairsNeeded = totalCards / 2;
    
    // Seleccionar emoji aleatorios para los pares
    const selectedEmojis = getRandomEmojis(pairsNeeded);
    
    // Crear array con pares de cartas
    cards = [];
    for (let i = 0; i < pairsNeeded; i++) {
        cards.push(selectedEmojis[i], selectedEmojis[i]);
    }
    
    // Mezclar las cartas (algoritmo Fisher-Yates)
    shuffleArray(cards);
    
    // Crear los elementos de las cartas
    cards.forEach((emoji, index) => {
        const card = document.createElement('div');
        card.className = 'memory-card';
        card.dataset.index = index;
        
        const frontFace = document.createElement('div');
        frontFace.className = 'front-face';
        frontFace.textContent = emoji;
        
        const backFace = document.createElement('div');
        backFace.className = 'back-face';
        backFace.textContent = '?';
        
        card.appendChild(frontFace);
        card.appendChild(backFace);
        
        card.addEventListener('click', flipCard);
        
        memoryBoard.appendChild(card);
    });
}

// Función para voltear una carta
function flipCard() {
    if (!gameStarted || gamePaused) return;
    
    const selectedCard = this;
    const index = selectedCard.dataset.index;
    
    // Ignorar si la carta ya está volteada o ya está emparejada
    if (flippedCards.length === 2 || 
        selectedCard.classList.contains('flipped') || 
        selectedCard.classList.contains('matched')) return;
    
    // Voltear la carta
    selectedCard.classList.add('flipped');
    flippedCards.push({ index, emoji: cards[index], element: selectedCard });
    
    // Verificar si tenemos un par
    if (flippedCards.length === 2) {
        moves++;
        updateMoves();
        
        if (flippedCards[0].emoji === flippedCards[1].emoji) {
            // Es un par coincidente
            matchedPairs++;
            setTimeout(() => {
                flippedCards[0].element.classList.add('matched');
                flippedCards[1].element.classList.add('matched');
                flippedCards = [];
                
                // Verificar si el juego ha terminado
                if (matchedPairs === cards.length / 2) {
                    gameOver();
                }
            }, 500);
        } else {
            // No es un par coincidente
            gamePaused = true;
            setTimeout(() => {
                flippedCards[0].element.classList.remove('flipped');
                flippedCards[1].element.classList.remove('flipped');
                flippedCards = [];
                gamePaused = false;
            }, 1000);
        }
    }
}

// Función para obtener emojis aleatorios
function getRandomEmojis(count) {
    const shuffled = [...emojis]; // Crear copia del array
    shuffleArray(shuffled);
    return shuffled.slice(0, count);
}

// Función para mezclar un array (algoritmo Fisher-Yates)
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// Función para cambiar la dificultad
function changeDifficulty() {
    gameSize = parseInt(difficultySelect.value);
    
    if (gameStarted) {
        resetGame();
        startGame();
    }
}

// Función para reiniciar el juego
function resetGame() {
    gameStarted = false;
    gamePaused = false;
    moves = 0;
    matchedPairs = 0;
    timer = 0;
    flippedCards = [];
    
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
    
    updateMoves();
    updateTimer();
    
    memoryBoard.innerHTML = '';
}

// Función para actualizar los movimientos
function updateMoves() {
    movesElement.textContent = moves;
}

// Función para actualizar el temporizador
function updateTimer() {
    const minutes = Math.floor(timer / 60);
    const seconds = timer % 60;
    timeElement.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

// Función para mostrar el modal de fin de juego
function gameOver() {
    clearInterval(timerInterval);
    finalMovesElement.textContent = moves;
    finalTimeElement.textContent = timer;
    
    setTimeout(() => {
        gameOverModal.classList.remove('hidden');
    }, 500);
}

// Función para cerrar el modal
function closeModal() {
    gameOverModal.classList.add('hidden');
    resetGame();
}
