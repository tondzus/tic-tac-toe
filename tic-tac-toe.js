function Analyzer(conf, board) {
	this.conf = conf;
	this.board = board;
	this.analyze = analyzerAnalyze;
	this.update = analyzerUpdate;
	this.reset = analyzerReset;
	this.hasWinner = analyzerHasWinner;
	this.reset();
}

function analyzerAnalyze(move) {
	var x = 0, y = 0, d = 0, start = 0, stop = 0,
			sx = this.conf['size-x'], sy = this.conf['size-y'];
	console.log(move.x + ' ' + move.y + '   ' + sx + ' ' + sy);

	this.reset();
	for(x=0; x < sx; x++) {
		this.update(this.board[x][move.y]);
		if(this.hasWinner()) {
			this.winningLine = {
				"start-x": x - this.conf['win-size'] + 1,	"start-y": move.y,
				"stop-x": x, "stop-y": move.y};
			return;
		}
	}

	this.reset();
	for(y=0; y < sy; y++) {
		this.update(this.board[move.x][y]);
		if(this.hasWinner()) {
			this.winningLine = {
				"start-x": move.x,	"start-y": y - this.conf['win-size'] + 1,
				"stop-x": move.x, "stop-y": y};
			return;
		}
	}

	this.reset();
	start = -Math.min(move.x, move.y);
	stop = Math.min(sx - move.x, sy - move.y);
	for(d=start; d < stop; d++) {
		this.update(this.board[move.x + d][move.y + d]);
		if(this.hasWinner()) {
			this.winningLine = {
				"start-x": move.x + d - this.conf['win-size'] + 1,
				"start-y": move.y + d - this.conf['win-size'] + 1,
				"stop-x": move.x + d, "stop-y": move.y + d};
			return;
		}
	}

	this.reset();
	start = -Math.min(sx - move.x - 1, move.y);
	stop = Math.min(move.x, sy - move.y + 1);
	console.log('start ' + start + ' ,stop ' + stop);
	for(d=start; d <= stop; d++) {
		this.update(this.board[move.x - d][move.y + d]);
		if(this.hasWinner()) {
			this.winningLine = {
				"start-x": move.x - d + this.conf['win-size'] - 1,
				"start-y": move.y + d - this.conf['win-size'] + 1,
				"stop-x": move.x - d, "stop-y": move.y + d};
			return;
		}
	}
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
	return this.conf['win-size'] == this.counter;
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
		ctx.moveTo(i*conf['step-x'], conf['step-y']/4);
		ctx.lineTo(i*conf['step-x'], canvas.clientHeight-conf['step-y']/4);
	}
	for(i=1; i < conf['size-y']; i++) {
		ctx.moveTo(conf['step-x']/4, i*conf['step-y']);
		ctx.lineTo(canvas.clientWidth-conf['step-x']/4, i*conf['step-y']);
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

function animateDraw(draw, ctx, conf, x, y, analyzer) {
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
		if(progress >= 1.0) {
			if(analyzer.hasWinner())
				drawWinningLine(ctx, conf, analyzer);
		}
	};
	var intervalId = setInterval(call, 10);
}

function drawWinningLine(ctx, conf, analyzer) {
	var startX = analyzer.winningLine['start-x'] + 0.5,
			startY = analyzer.winningLine['start-y'] + 0.5,
			stopX = analyzer.winningLine['stop-x'] + 0.5,
			stopY = analyzer.winningLine['stop-y'] + 0.5;
	ctx.beginPath();
	ctx.moveTo(startX * conf['step-x'], startY * conf['step-y']);
	ctx.lineTo(stopX * conf['step-x'], stopY * conf['step-y']);
	ctx.strokeStyle = 'green';
	ctx.lineWidth = conf['piece-size'] + 2;
	ctx.stroke();
}

function userInput(canvas, conf, board, event) {
	var xPix = event.pageX - canvas.offsetLeft,
		  yPix = event.pageY - canvas.offsetTop;
	var x = Math.floor(xPix / conf['step-x']),
			y = Math.floor(yPix / conf['step-y']);

	if(board[x][y] != '-') {
		return;
	}

	board[x][y] = conf['next-move'];
	if(conf['next-move'] == 'x') {
		conf['next-move'] = 'o';
		drawFunc = drawX;
	}else {
		conf['next-move'] = 'x';
		drawFunc = drawO;
	}

	var analyzer = new Analyzer(conf, board);
	analyzer.analyze({"x": x, "y": y});
	animateDraw(drawFunc, canvas.getContext('2d'), conf, x, y, analyzer);
	return analyzer.hasWinner();
}

function startGame() {
	var canvas = document.getElementById("game-canvas");
	var conf = {
		"square-size": 150,
		"max-x-size": 700,
		"max-y-size": 550,
		"win-size": 4,
		"size-x": 14,
		"size-y": 7,
		"scale": 0.6,
		"next-move": "x"
	};
	var board = createEmptyGameboard(conf);

	initCanvas(canvas, conf);
	redraw(canvas, conf, board);

	var userInputListener = function(event) {
		redraw(canvas, conf, board);
		gameEnded = userInput(canvas, conf, board, event);
		if(gameEnded)
			canvas.removeEventListener('click', userInputListener);
	};

	canvas.addEventListener('click', userInputListener);
}

window.onload = startGame;
