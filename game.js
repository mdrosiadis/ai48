
const gameDiv = document.querySelector("#game");
console.log(gameDiv);


const gameCells = game.querySelectorAll(".game-cell");

const grid = [
	[null, null, null, null],
	[null, null, null, null],
	[null, null, null, null],
	[null, null, null, null],
]



function updateCell(cell) {
	const row = cell.dataset.row -1;
	const col = cell.dataset.col-1;

	cell.style.top = `${row*25}%`;
	cell.style.left = `${col*25}%`;
	cell.style.visibility = 'visible';
}

// activate
gameCells.forEach(cell => {
	updateCell(cell);
	//cell.classList.add("active");
});

setInterval(() => {
	gameCells.forEach(cell => cell.classList.add("active"));
}, 0.2)

const aCell = gameCells[0];

function getCellPos(cell) {
	return [parseInt(cell.dataset.row), parseInt(cell.dataset.col)];
}

function moveCell(cell, row, col) {
	cell.dataset.row = row;
	cell.dataset.col = col;

	updateCell(cell);
}


function test() {
	moveCell(aCell, 2, 3);
}

document.addEventListener('keydown', (event) => {
  const [r, c] = getCellPos(aCell);
  switch (event.key) {
    case 'ArrowUp':
		moveCell(aCell, Math.max(1, r-1), c);
      break;
    case 'ArrowDown':
		moveCell(aCell, Math.min(4, r+1), c);
      break;
    case 'ArrowLeft':
		moveCell(aCell, r, Math.max(1, c-1));
      break;
    case 'ArrowRight':
		moveCell(aCell, r, Math.min(4, c+1));
      break;
    default:
      // do nothing for other keys
      break;
  }
});

