const cells = document.querySelectorAll('.cell');
const modeSelect = document.getElementById('mode');
const restartBtn = document.getElementById('restart');
let board = Array(9).fill('');
const human = 'X';
const aiSymbol = 'O';
let gameActive = true;

function render() {
  board.forEach((val, idx) => cells[idx].innerText = val);
}

function checkWinnerJS(arr) {
  const wins = [
    [0,1,2],[3,4,5],[6,7,8],
    [0,3,6],[1,4,7],[2,5,8],
    [0,4,8],[2,4,6]
  ];
  for (const [x, y, z] of wins) {
    if (arr[x] && arr[x] === arr[y] && arr[x] === arr[z]) {
      return arr[x];
    }
  }
  if (arr.every(cell => cell)) return 'Draw';
  return null;
}

async function aiMoveFor(symbol) {
  const res = await fetch('/api/tictactoe/ai_move', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({board, ai: symbol})
  });
  const { move } = await res.json();
  board[move] = symbol;
  render();
  return move;
}

function showWinMessage(winner) {
  alert(winner === 'Draw' ? "It's a draw!" : `${winner} wins!`);
  gameActive = true;
}

async function playHumanVsAI(index) {
  if (!gameActive || board[index]) return;
  gameActive = false;
  
  // Human move
  board[index] = human;
  render();
  
  let winner = checkWinnerJS(board);
  if (winner) {
    showWinMessage(winner);
    return;
  }
  
  // AI move
  const aiMove = await aiMoveFor(aiSymbol);
  winner = checkWinnerJS(board);
  if (winner) {
    showWinMessage(winner);
    return;
  }
  
  gameActive = true;
}

async function playAIvsAI() {
  board = Array(9).fill('');
  render();
  let current = 'X';
  let winner = null;
  
  while (!winner) {
    await aiMoveFor(current);
    winner = checkWinnerJS(board);
    if (winner) {
      showWinMessage(winner);
      break;
    }
    current = current === 'X' ? 'O' : 'X';
  }
}

// Event listeners
cells.forEach(cell => cell.addEventListener('click', e => {
  if (modeSelect.value === 'human') {
    playHumanVsAI(+e.target.dataset.index);
  }
}));

modeSelect.addEventListener('change', () => {
  board = Array(9).fill('');
  render();
  gameActive = true;
  if (modeSelect.value === 'ai') playAIvsAI();
});

restartBtn.addEventListener('click', () => {
  board = Array(9).fill('');
  render();
  gameActive = true;
  if (modeSelect.value === 'ai') playAIvsAI();
});

// Initial render
render();