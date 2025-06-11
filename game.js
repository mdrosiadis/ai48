const tileColors = {
  0: "#cdc1b4",        // empty cell
  2: "#eee4da",
  4: "#ede0c8",
  8: "#f2b179",
  16: "#f59563",
  32: "#f67c5f",
  64: "#f65e3b",
  128: "#edcf72",
  256: "#edcc61",
  512: "#edc850",
  1024: "#edc53f",
  2048: "#edc22e",
  4096: "#3c3a32",     // optional extra
  8192: "#3c3a32",     // same as above
  default: "#3c3a32"   // for tiles > 2048
};

const gameDiv = document.querySelector("#game");
console.log(gameDiv);



class Cell {
	constructor(row, col, val) {
		this.row = row;
		this.column = col;
		this.value = val;
		this.domElem = document.createElement("div");
		this.domElem.classList.add("game-cell");
		this.domElem.classList.add("active");

		this.setValue(val);
		this.setColor(tileColors[val]);
		gameDiv.appendChild(this.domElem);

		this.moveTo(row, col);
	}

	moveTo(row, col) {
		this.row = row;
		this.column = col;

		this.domElem.style.top = `${row*25 + 12.5}%`;
		this.domElem.style.left = `${col*25 + 12.5}%`;
	}

	setColor(color) {
		this.domElem.style.backgroundColor = color;

	}
	setValue(val) {
		this.value = val;
		this.domElem.innerText = val;
	}

}

function PassThrough(rc) {
	return rc;
}

function VerticalMirror(rc) {
	return [rc[0], 4-1-rc[1]];
}

function HorizontalMirror(rc) {
	return [4-1-rc[0], rc[1]];
}

function Transposed(rc) {
	return [rc[1], rc[0]];
}

const ClockWise = rc => VerticalMirror(Transposed(rc))
const CounterClockWise = rc => Transposed(VerticalMirror(rc))

function Flatten(rc) {
	return rc[0] * 4 + rc[1];
}

function UnFlatten(i) {
	const r = Math.floor(i / 4);
	const c = i % 4;

	return [r, c];
}

function PosEquals(a, b) {
	return a[0] == b[0] && a[1] == b[1];
}


function Turn(grid, transform=null) {
	if(transform === null) {
		transform = PassThrough;
	}

	function getter(r, c) {
		const [nr, nc] = transform([r, c]);
		return grid[nr][nc];
	}

	function setter(r, c, val) {
		const [nr, nc] = transform([r, c]);
		grid[nr][nc] = val;
	}

	const moves = [];
	for(let r=0; r < 4; r++) {
		let newP = -1;
		for(let c=1; c < 4; c++) {
			let nc = c;
			let value = getter(r, c); // todo
			if(value === null) continue;
			let slide = c-1;
			while(slide > newP && getter(r, slide) == null) {
				nc = slide;
				slide--;
			}
			let newVal = value;
			if(slide > newP) {
				if(getter(r, slide) == value) {
					newVal = value * 2;
					nc = slide;
					newP = slide;
					const target = transform([r, slide]);
					if(moves.length > 0 && 
						moves[moves.length-1].hasOwnProperty('to') && 
						PosEquals(moves[moves.length-1]['to'], target))
					{
						moves[moves.length-1]['tp'] = 'vanish';
					}
					else {
						moves.push({pos: transform([r, slide]), tp: 'delete'});
					}
				}
			}

			if(c != nc) {
				moves.push({pos: transform([r, c]), tp: 'move', to: transform([r, nc]), newVal: newVal});
				setter(r, c, null);
				setter(r, nc, newVal);
			}
		}
	}

	return moves;
}


let grid = [
	[null, 2, 2, null],
	[2, null, null, null],
	[null, null, null, 2],
	[2, null, null, 2],
]

function CellToGrid(cells) {
	const result = [];
	const result_dom = [];
	for(let r=0; r < 4; r++) {
		const row = [];
		const row_dom = [];
		for(let c=0; c < 4; c++) {
			row.push(null);
			row_dom.push(null);
		}
		result.push(row);
		result_dom.push(row_dom);
	}
	cells.forEach(cell => {
		result[cell.row][cell.column] = cell.value;
		result_dom[cell.row][cell.column] = cell;
	});

	return [result, result_dom];
}

function GridToCells(grid) {
	const cells = [];
	for(let r=0; r < 4; r++) {
		for(let c=0; c < 4; c++) {
			if(grid[r][c] !== null)
				cells.push(new Cell(r, c, grid[r][c]));
		}
	}

	return cells;
}

function Remove(cell) {
	return () => {
		cells.splice(cells.indexOf(cell), 1);
		cell.domElem.remove();
	}
}

function Update(cell, newVal) {
	return () => cell.setValue(newVal);
}

function ApplyMoves(cell_grid, moves) {
	const afterEffects = [];

	for(let move of moves) {
		const [r, c] = move.pos;
		const cell = cell_grid[r][c];
		switch(move.tp) {
			case 'delete': 
				cell.domElem.style.width = 0;
				cell.domElem.style.height = 0;
				afterEffects.push(Remove(cell));
				break;

			case 'move': 
				cell.moveTo(move.to[0], move.to[1]);
				cell.setColor(tileColors[move.newVal]);
				afterEffects.push(Update(cell, move.newVal));
				break;

			case 'vanish':
				cell.moveTo(move.to[0], move.to[1]);
				cell.domElem.style.width = 0;
				cell.domElem.style.height = 0;

				afterEffects.push(Remove(cell));
			break;

		}
	}

	setTimeout(() => {
		afterEffects.forEach(ae => ae.call());
	}, 100);
}

function runEffects(effects) {
	effects.forEach(e => e.call());
}

let cells = GridToCells(grid);

function Show(grid) {
	console.table(grid);
}
//
// const arr = [];
// for(let i=0; i < 16; i++) {
// 	const [r, c] = UnFlatten(i);
// 	cells.push(new Cell(r, c, i));
// 	arr.push(i);
// }

function Test(getter) {
	cells.forEach(cell => {
		const r = cell.row;
		const c = cell.column;

		const [nr, nc] = getter([r, c]);
		cell.moveTo(nr, nc);
	});
}

function DebugArray(){
	const result = [];
	for(let r=0; r < 4; r++) {
		const row = [];
		for(let c=0; c < 4; c++) {
			row.push(null);
		}
		result.push(row);
	}
	cells.forEach(cell => {
		result[cell.row][cell.column] = cell.value
	});
	console.table(result);
}

function Render(getter) {
	const result = [];
	for(let r=0; r < 4; r++) {
		const row = [];
		for(let c=0; c < 4; c++) {
			row.push(Flatten(getter([r, c])));
		}
		result.push(row);
	}
	console.table(result);
}

function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}

document.addEventListener('keydown', (event) => {
	let transform;
	switch (event.key) {
		case 'ArrowUp':
			transform = ClockWise;
			break;
		case 'ArrowDown':
			transform = CounterClockWise;
			break;

		case 'ArrowRight':
			transform = VerticalMirror;
			break;

		case 'ArrowLeft':
			transform = PassThrough;
			break; 
		default:
			// do nothing for other keys
			return;
	}

	const [grid, dom] = CellToGrid(cells);
	const moves = Turn(grid, transform);
	ApplyMoves(dom, moves);


	const free = [];
	for(let r=0; r < 4; r++) {
		for(let c=0; c < 4; c++) {
			if(grid[r][c] === null)
				free.push([r, c]);
		}
	}

	if(free) {
		const idx = getRandomInt(free.length);
		const [r, c] = free[idx];
		cells.push(new Cell(r, c, 2));
	}

});
