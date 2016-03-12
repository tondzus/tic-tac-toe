function Analyzer(conf) {
	this.winSize = conf['win-size'];
	this.counter = 0;
	this.lastMark = '';
	this.update = analyzerUpdate;
	this.hasWinner = analyzerHasWinner;
	this.winner = analyzerWinner;
	this.reset = analyzerReset;
}

function analyzerUpdate(mark) {
	if(this.hasWinner())
		return;

	if(mark == '-') {
		this.counter = 0;
		this.lastMark = '';
		return;
	}
	if(this.counter == 0) {
		this.counter = 1;
		this.lastMark = mark;
	}else {
		if(this.lastMark == mark)
			this.counter++;
		else {
			this.counter = 1;
			this.lastMark = mark;
		}
	}
}

function analyzerHasWinner() {
	return this.winSize == this.counter;
}

function analyzerWinner() {
	return this.lastMark;
}

function analyzerReset() {
	this.counter = 0;
	this.lastMark = '';
}

function updateConf(canvas, conf) {
	conf['step-x'] = canvas.width / conf['size-x'];
	conf['step-y'] = canvas.height / conf['size-y'];
}

function drawBackground(canvas, conf) {
	ctx = canvas.getContext("2d");
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	ctx.beginPath();
	for(var i=1; i < conf['size-x']; i++) {
		ctx.moveTo(i*conf['step-x'], 0);
		ctx.lineTo(i*conf['step-x'], canvas.clientHeight);
	}
	for(i=1; i < conf['size-y']; i++) {
		ctx.moveTo(0, i*conf['step-y']);
		ctx.lineTo(canvas.clientWidth, i*conf['step-y']);
	}
	ctx.closePath();
	ctx.lineWidth = 4;
	ctx.strokeStyle = 'black';
	ctx.stroke();
}

function drawO(ctx, scale, top, bottom, left, right) {
	radius = ((bottom - top) / 2) * scale;
	centerX = top + ((bottom - top) / 2);
	centerY = left + ((right - left) / 2);
	ctx.beginPath();
	ctx.arc(centerX, centerY, radius, 0, 2*Math.PI, false);
	ctx.closePath();
	ctx.strokeStyle = 'red';
	ctx.lineWidth = 6;
	ctx.stroke();
}

function drawX(ctx, scale, top, bottom, left, right) {
	diff = ((bottom - top) * (1 - scale)) / 2;
	ctx.beginPath();
	ctx.moveTo(top + diff, left + diff);
	ctx.lineTo(bottom - diff, right - diff);
	ctx.moveTo(top + diff, right - diff);
	ctx.lineTo(bottom - diff, left + diff);
	ctx.closePath();
	ctx.strokeStyle = 'blue';
	ctx.lineWidth = 6;
	ctx.stroke();
}

function drawPieces(canvas, conf, board) {
	for(var x=0; x < conf['size-x']; x++) {
		for(var y=0; y < conf['size-y']; y++) {
			if(board[x][y] == 'x')
				drawX(canvas.getContext('2d'), conf.scale,
							 x*conf['step-x'], (x+1)*conf['step-x'],
							 y*conf['step-y'], (y+1)*conf['step-y']);
			if(board[x][y] == 'o')
				drawO(canvas.getContext('2d'), conf.scale,
							 x*conf['step-x'], (x+1)*conf['step-x'],
							 y*conf['step-y'], (y+1)*conf['step-y']);
		}
	}
}

function createEmptyGameboard(conf) {
	var gameboard = new Array(conf['size-x']);
	for(var i=0; i < conf['size-x']; i++) {
		gameboard[i] = new Array(conf['size-y']);
		for(var j=0; j < conf['size-y']; j++) {
			gameboard[i][j] = '-';
		}
	}
	return gameboard;
}

function initCanvas(canvas, conf) {
	canvas.width = conf['size-x'] * conf['square-size'];
	canvas.height = conf['size-y'] * conf['square-size'];
}

function redraw(canvas, conf, board) {
	updateConf(canvas, conf);
	drawBackground(canvas, conf);
	drawPieces(canvas, conf, board);
}

function userInput(canvas, conf, board, event) {
	var xPix = event.pageX - canvas.offsetLeft,
		  yPix = event.pageY - canvas.offsetTop;
	var x = Math.floor(xPix / conf['step-x']),
			y = Math.floor(yPix / conf['step-y']);

	if(board[x][y] == '-') {
		board[x][y] = conf['next-move'];
		conf['next-move'] = conf['next-move'] == 'x' ? 'o' : 'x';
	}
}

function checkVictory(canvas, conf, board) {
	var analyzer = new Analyzer(conf), x = 0, y = 0, dia = 0;
	var sx = conf['size-x'], sy = conf['size-y'], startX = 0, startY = 0;

	// horizontal check
	for(x=0; x < sx; x++) {
		analyzer.reset();
		for(y=0; y < sy; y++) {
			analyzer.update(board[x][y]);
			if(analyzer.hasWinner()) {
				return analyzer.winner();
			}
		}
	}

	// vertical check
	analyzer.reset();
	for(y=0; y < sy; y++) {
		analyzer.reset();
		for(x=0; x < sx; x++) {
			analyzer.update(board[x][y]);
			if(analyzer.hasWinner()) {
				return analyzer.winner();
			}
		}
	}

	// diagonal check
	for(dia=conf['win-size']-1; dia < (sx + sy - 1); dia++) {
		analyzer.reset();
		startX = Math.max(0, dia - sy - 1);
		startY = Math.max(0, sy - 1 - dia);
		for(x=startX, y=startY; (x < sx) && (y < sy); x++, y++) {
			analyzer.update(board[x][y]);
			if(analyzer.hasWinner()) {
				return analyzer.winner();
			}
		}
	}

	// anti-diagonal check
	for(dia=conf['win-size']-1; dia < (sx + sy - 1); dia++) {
		analyzer.reset();
		startX = sx - Math.max(0, dia - sy - 1) - 1;
		startY = Math.max(0, sy - 1 - dia);
		for(x=startX, y=startY; (x >= 0) && (y < sy); x--, y++) {
			analyzer.update(board[x][y]);
			if(analyzer.hasWinner()) {
				return analyzer.winner();
			}
		}
	}
	return null;
}

function startGame() {
	var canvas = document.getElementById("game-canvas");
	var conf = {
		"square-size": 150,
		"win-size": 3,
		"size-x": 3,
		"size-y": 3,
		"scale": 0.6,
		"next-move": "x"
	};
	var board = createEmptyGameboard(conf);

	initCanvas(canvas, conf);
	redraw(canvas, conf, board);

	var userInputListener = function(event) {
		userInput(canvas, conf, board, event);
		redraw(canvas, conf, board);
		victorious = checkVictory(canvas, conf, board);
		console.log(victorious);
		if(victorious !== null)
			canvas.removeEventListener('click', userInputListener);
	};

	canvas.addEventListener('click', userInputListener);
}

window.onload = startGame;
