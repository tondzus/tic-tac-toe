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
	var small = conf['size-x'] > 15 || conf['size-y'] > 15;
	conf['background-size'] = small ? 2 : 4;
	conf['piece-size'] = small ? 3 : 6;
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
	ctx.lineWidth = conf['background-size'];
	ctx.strokeStyle = 'black';
	ctx.stroke();
}

function getPosition(x, y, conf) {
	return {
		"top": x * conf['step-x'],
		"bottom": (x + 1) * conf['step-x'],
		"left": y * conf['step-y'],
		"right": (y + 1) * conf['step-y']
	};
}

function drawO(ctx, conf, x, y, progress) {
	progress = Math.max(Math.min(progress, 1), 0);
	var positions = getPosition(x, y, conf);
	var top = positions.top, bottom = positions.bottom,
			left = positions.left, right = positions.right;

	radius = ((bottom - top) / 2) * conf.scale;
	centerX = top + ((bottom - top) / 2);
	centerY = left + ((right - left) / 2);
	ctx.beginPath();
	ctx.arc(centerX, centerY, radius, 0, progress * 2*Math.PI, false);
	ctx.strokeStyle = 'red';
	ctx.lineWidth = conf['piece-size'];
	ctx.stroke();
}

function drawX(ctx, conf, x, y, progress) {
	progress = Math.max(Math.min(progress, 1), 0);
	var positions = getPosition(x, y, conf);
	var top = positions.top, bottom = positions.bottom,
			left = positions.left, right = positions.right;

	diff = ((bottom - top) * (1 - conf.scale)) / 2;
	ctx.beginPath();
	var dirX = bottom - diff - top - diff,
			dirY = right - diff - left - diff,
			coef = Math.min(progress, 0.5) * 2;
	ctx.moveTo(top + diff, left + diff);
	ctx.lineTo(top + diff + coef * dirX, left + diff + coef * dirY);
	if(progress > 0.5) {
		dirY *= -1;
		coef = Math.min(progress - 0.5, 0.5) * 2;
		ctx.moveTo(top + diff, right - diff);
		ctx.lineTo(top + diff + coef * dirX, right - diff + coef * dirY);
	}
	ctx.strokeStyle = 'blue';
	ctx.lineWidth = conf['piece-size'];
	ctx.stroke();
}

function drawPieces(canvas, conf, board) {
	for(var x=0; x < conf['size-x']; x++) {
		for(var y=0; y < conf['size-y']; y++) {
			if(board[x][y] == 'x')
				drawX(canvas.getContext('2d'), conf, x, y, 1);
			if(board[x][y] == 'o')
				drawO(canvas.getContext('2d'), conf, x, y, 1);
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
	var cw = conf['size-x'] * conf['square-size'];
	var ch = conf['size-y'] * conf['square-size'];
	var coefX = (cw > conf['max-x-size']) ? conf['max-x-size'] / cw : 1;
	var coefY = (ch > conf['max-y-size']) ? conf['max-y-size'] / ch : 1;
	canvas.width = cw * Math.min(coefX, coefY);
	canvas.height = ch * Math.min(coefX, coefY);
}

function redraw(canvas, conf, board) {
	updateConf(canvas, conf);
	drawBackground(canvas, conf);
	drawPieces(canvas, conf, board);
}

function animateDraw(draw, ctx, conf, x, y) {
	var progress = 0.0;
	var positions = getPosition(x, y, conf);
	var bgSize = conf['background-size'];
	var top = positions.top, bottom = positions.bottom,
			left = positions.left, right = positions.right;

	var call = function() {
		if(progress >= 1.0) {
			clearInterval(intervalId);
		}
		ctx.clearRect(top + bgSize/2 + 1, left + bgSize/2 + 1,
									conf['step-y'] - bgSize - 2, conf['step-x'] - bgSize - 2);
		progress += 0.05;
		ctx.fillStyle = 'white';
		draw(ctx, conf, x, y, progress);
	};
	var intervalId = setInterval(call, 10);
}

function userInput(canvas, conf, board, event) {
	var xPix = event.pageX - canvas.offsetLeft,
		  yPix = event.pageY - canvas.offsetTop;
	var x = Math.floor(xPix / conf['step-x']),
			y = Math.floor(yPix / conf['step-y']);

	if(board[x][y] == '-') {
		board[x][y] = conf['next-move'];
		if(conf['next-move'] == 'x') {
			conf['next-move'] = 'o';
			animateDraw(drawX, canvas.getContext('2d'), conf, x, y);
		}else {
			conf['next-move'] = 'x';
			animateDraw(drawO, canvas.getContext('2d'), conf, x, y);
		}
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
		"max-x-size": 700,
		"max-y-size": 550,
		"win-size": 4,
		"size-x": 18,
		"size-y": 8,
		"scale": 0.6,
		"next-move": "x"
	};
	var board = createEmptyGameboard(conf);

	initCanvas(canvas, conf);
	redraw(canvas, conf, board);

	var userInputListener = function(event) {
		redraw(canvas, conf, board);
		userInput(canvas, conf, board, event);
		victorious = checkVictory(canvas, conf, board);
		console.log(victorious);
		if(victorious !== null)
			canvas.removeEventListener('click', userInputListener);
	};

	canvas.addEventListener('click', userInputListener);
}

window.onload = startGame;
