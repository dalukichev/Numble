const gameContainer = document.getElementById('game-container');
const grid = document.getElementById('grid');
const gameOverOverlay = document.getElementById('game-over-overlay');
const gameOverText = document.getElementById('game-over-text');
const restartButton = document.getElementById('restart-button');
const startOverlay = document.getElementById('start-overlay');
const startButton = document.getElementById('start-button');
const scoreElement = document.getElementById('score');

const rows = 7;
const cols = 5;
let gridData;
let currentNumber;
let currentCol;
let currentRow;
let dropInterval;
let gameOver = false;
let maxAchievedNumber = 2;
let allowedNumbers = [2, 4, 8];
let score = 0;

function initGame() {
  gridData = Array.from({ length: rows }, () => Array(cols).fill(0));
  currentNumber = generateRandomNumber();
  currentCol = Math.floor(cols / 2);
  currentRow = 0;
  gameOver = false;
  maxAchievedNumber = 2;
  allowedNumbers = [2, 4, 8];
  score = 0;
  updateScore(0);

  gameOverOverlay.style.display = 'none';
  startOverlay.style.display = 'none';

  if (dropInterval) {
    clearInterval(dropInterval);
  }
  dropInterval = setInterval(() => {
    dropNumber();
    drawGrid();
    checkGameOver();
  }, 1000);
}

function startGame() {
  gameOverOverlay.style.display = 'none';
  startOverlay.style.display = 'none';
  initGame();
}

document.addEventListener('keydown', handleKeyPress);
restartButton.addEventListener('click', initGame);
startButton.addEventListener('click', startGame);

function generateRandomNumber() {
  return allowedNumbers[Math.floor(Math.random() * allowedNumbers.length)];
}

function drawGrid() {
  grid.innerHTML = '';
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const cell = document.createElement('div');
      cell.classList.add('cell');
      if (gridData[row][col] !== 0) {
        cell.textContent = gridData[row][col];
        cell.style.backgroundColor = getColorForNumber(gridData[row][col]);
        if (gridData[row][col] === 2048) {
          displayWinMessage();
        }
      }
      grid.appendChild(cell);
    }
  }
  if (!gameOver) {
    drawCurrentNumber();
  }
}

function drawCurrentNumber() {
  if (currentRow < rows) {
    const cellIndex = currentRow * cols + currentCol;
    const cell = grid.children[cellIndex];
    cell.textContent = currentNumber;
    cell.style.backgroundColor = getColorForNumber(currentNumber);
  }
}

function handleKeyPress(event) {
  if (gameOver && event.key.toLowerCase() === 'r') {
    initGame();
    return;
  }

  if (gameOver) return;

  if (event.key === 'ArrowLeft' && currentCol > 0 && gridData[currentRow][currentCol - 1] === 0) {
    currentCol--;
  } else if (event.key === 'ArrowRight' && currentCol < cols - 1 && gridData[currentRow][currentCol + 1] === 0) {
    currentCol++;
  } else if (event.key === 'ArrowDown') {
    dropNumber();
  }
  drawGrid();
}

function dropNumber() {
  if (currentRow < rows - 1 && gridData[currentRow + 1][currentCol] === 0) {
    currentRow++;
  } else {
    if (currentRow < rows - 1 && gridData[currentRow + 1][currentCol] !== 0) {
      handleCollision(currentRow + 1, currentCol);
    } else {
      gridData[currentRow][currentCol] = currentNumber;
      updateAllowedNumbers(gridData[currentRow][currentCol]);
    }
    mergeColumn(currentCol); // Merge column after placing the number
    currentNumber = generateRandomNumber();
    currentCol = Math.floor(cols / 2);
    currentRow = 0;
  }
  drawGrid();
}

function handleCollision(row, col) {
  const existingNumber = gridData[row][col];

  if (existingNumber === currentNumber) {
    const newNumber = existingNumber * 2;
    gridData[row][col] = newNumber;
    updateAllowedNumbers(newNumber);
    updateScore(newNumber);
  } else {
    gridData[row][col] = existingNumber;
    if (row > 0) {
      gridData[row - 1][col] = currentNumber;
      updateAllowedNumbers(gridData[row - 1][col]);
    }
  }
  mergeColumn(col); // Merge column after handling collision
}

function updateAllowedNumbers(newNumber) {
  if (newNumber > maxAchievedNumber) {
    maxAchievedNumber = newNumber;
    switch (newNumber) {
      case 64:
        allowedNumbers = [4, 8, 16];
        removeNumberFromGrid(2);
        break;
      case 256:
        allowedNumbers = [8, 16, 32];
        removeNumberFromGrid(4);
        break;
      case 1024:
        allowedNumbers = [16, 32, 64];
        removeNumberFromGrid(8);
        break;
    }
  }
}

function removeNumberFromGrid(number) {
  for (let col = 0; col < cols; col++) {
    for (let row = rows - 1; row >= 0; row--) {
      if (gridData[row][col] === number) {
        gridData[row][col] = 0;
      }
    }
    collapseColumn(col);
  }
}

function mergeColumn(col) {
  let merged = false;
  do {
    merged = false;
    for (let row = rows - 1; row > 0; row--) {
      if (gridData[row][col] !== 0 && gridData[row][col] === gridData[row - 1][col]) {
        gridData[row][col] *= 2;
        gridData[row - 1][col] = 0;
        updateAllowedNumbers(gridData[row][col]);
        updateScore(gridData[row][col]);
        collapseColumn(col); // Collapse column after merging
        merged = true;
      }
    }
  } while (merged);
}

function collapseColumn(col) {
  for (let row = rows - 1; row > 0; row--) {
    if (gridData[row][col] === 0) {
      for (let r = row; r > 0; r--) {
        gridData[r][col] = gridData[r - 1][col];
        gridData[r - 1][col] = 0;
      }
    }
  }
}

function checkGameOver() {
  for (let col = 0; col < cols; col++) {
    if (gridData[0][col] !== 0) {
      clearInterval(dropInterval);
      gameOver = true;
      gameOverOverlay.style.display = 'flex';
      gameOverText.textContent = 'Game Over!';
      break;
    }
  }
}

function displayWinMessage() {
  clearInterval(dropInterval);
  gameOver = true;
  gameOverOverlay.style.display = 'flex';
  gameOverText.textContent = 'You won! Play again?';
}

function updateScore(value) {
  score += value;
  scoreElement.textContent = score;
}

function getColorForNumber(number) {
  const colors = {
    2: '#eee4da',
    4: '#ede0c8',
    8: '#f2b179',
    16: '#f59563',
    32: '#f67c5f',
    64: '#f65e3b',
    128: '#edcf72',
    256: '#edcc61',
    512: '#edc850',
    1024: '#edc53f',
    2048: '#edc22e',
  };
  return colors[number] || '#cdc1b4';
}

window.onload = function() {
  gameOverOverlay.style.display = 'none';
  startOverlay.style.display = 'flex';
};
