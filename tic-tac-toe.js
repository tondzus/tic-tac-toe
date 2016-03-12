function draw_background(canvas, conf) {
	stepX = canvas.clientWidth / conf['size-x'];
	stepY = canvas.clientHeight / conf['size-y'];

	ctx = canvas.getContext("2d");
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	ctx.beginPath();
	for(var i=1; i < conf['size-x']; i++) {
		ctx.moveTo(i*stepX, 0);
		ctx.lineTo(i*stepX, canvas.clientHeight);
	}
	for(i=1; i < conf['size-y']; i++) {
		ctx.moveTo(0, i*stepY);
		ctx.lineTo(canvas.clientWidth, i*stepY);
	}
	ctx.closePath();
	ctx.stroke();
}

window.onload = function() {
	var canvas = document.getElementById("game-canvas");
	var conf = {
		"size-x": 3,
		"size-y": 3
	};

	draw_background(canvas, conf);
};
