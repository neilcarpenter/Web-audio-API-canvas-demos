// stats
var stats = new Stats();
stats.setMode(0);
stats.domElement.style.position = 'absolute';
stats.domElement.style.right = '0px';
stats.domElement.style.top = '0px';
stats.domElement.style.zIndex = '10';
document.body.appendChild( stats.domElement );

var WIDTH, HEIGHT, HALF_WIDTH, HALF_HEIGHT, ASPECT_RATIO;
var WIDTH_RATIO, HEIGHT_RATIO, analyser, audio, audioContext, source, gainNode, maxMagnitude, c, ctx;

var settings = {
	circles: 30,
	hue: 0
};

var mouse = {
	x: 0,
	y: 0
};

window.addEventListener('load', init, false);
document.addEventListener('mousemove', mouseMove, false);

window.onresize = function() {
	WIDTH = window.innerWidth;
	HEIGHT = window.innerHeight;
	HALF_WIDTH = WIDTH / 2;
	HALF_HEIGHT = HEIGHT / 2;
	ASPECT_RATIO = HEIGHT / WIDTH;

	WIDTH_RATIO = WIDTH / 1024;
	HEIGHT_RATIO = HEIGHT / 255;

	maxMagnitude = 1024 * 255;

	c.width = WIDTH;
	c.height = HEIGHT;
};

function init() {
	WIDTH = window.innerWidth;
	HEIGHT = window.innerHeight;
	HALF_WIDTH = WIDTH / 2;
	HALF_HEIGHT = HEIGHT / 2;
	ASPECT_RATIO = HEIGHT / WIDTH;

	WIDTH_RATIO = WIDTH / 1024;
	HEIGHT_RATIO = HEIGHT / 255;

	maxMagnitude = 1024 * 255;

	setupWebAudio();
	createCanvas();
	draw();
}

function setupWebAudio() {
	audio = document.getElementsByTagName('audio')[0];
	
	audioContext = new webkitAudioContext();
	analyser = audioContext.createAnalyser();
	source = audioContext.createMediaElementSource(audio);
	source.connect(analyser);

	// // this is just to shut it up in dev mode
	// // Create a gain node.
	// gainNode = audioContext.createGainNode();
	// // Connect the source to the gain node.
	// source.connect(gainNode);
	// // Connect the gain node to the destination.
	// gainNode.connect(audioContext.destination);
	// gainNode.gain.value = -1;

	analyser.connect(audioContext.destination);

	audio.play();
}

function draw() {

	var totals = [], ratio, strength, totalMagnitude;

	webkitRequestAnimationFrame(draw);

	stats.update();

	var freqByteData = new Uint8Array(analyser.frequencyBinCount);

	analyser.getByteFrequencyData(freqByteData);

	ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
	ctx.fillRect(0, 0, WIDTH, HEIGHT);

	totalMagnitude = 0;

	for (var i = 0; i < settings.circles; i += 1) {

		totals[i] = {'magnitude': 0};

		for (var j = 0; j < (1024 / (i+1)); j += 1) {

			totals[i].magnitude += freqByteData[j];

		}

		totals[i].ratio = totals[i].magnitude / (maxMagnitude / settings.circles);
		totals[i].strength = totals[i].ratio * HEIGHT / settings.circles;

		ctx.strokeStyle = 'hsla(' + settings.hue + ', 50%, 50%, ' + ((1 / settings.circles) + 0.1) + ')';
		ctx.fillStyle = 'hsla(' + settings.hue + ', 50%, 50%, ' + (1 / settings.circles) + ')';
		ctx.beginPath();
		ctx.arc(mouse.x ,mouse.y, totals[i].strength, 0, Math.PI*2, true);
		ctx.stroke();
		ctx.fill();

		totalMagnitude += totals[i].magnitude;
		
	}

	ratio = totalMagnitude / maxMagnitude;
	ctx.fillStyle = 'hsla(' + settings.hue + ', 50%, 50%, ' + (0.005 * ratio) + ')';
	ctx.fillRect(0, 0, WIDTH, HEIGHT);
}

function createCanvas() {
	c = document.createElement('canvas');
	ctx = c.getContext('2d');
	c.width = WIDTH;
	c.height = HEIGHT;
	c.style.position = 'absolute';
	c.style.top = 0;
	c.style.left = 0;
	
	document.body.appendChild(c);
}

function mouseMove(e) {
	mouse.x = e.offsetX;
	mouse.y = e.offsetY;

	settings.hue = (mouse.x / WIDTH * 180) + (mouse.y / HEIGHT * 180);
}