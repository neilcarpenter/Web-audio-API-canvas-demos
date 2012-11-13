// stats
var stats = new Stats();
stats.setMode(0);
stats.domElement.style.position = 'absolute';
stats.domElement.style.right = '0px';
stats.domElement.style.top = '0px';
stats.domElement.style.zIndex = '10';
document.body.appendChild( stats.domElement );

var WIDTH, HEIGHT, HALF_WIDTH, HALF_HEIGHT, ASPECT_RATIO;
var WIDTH_RATIO, HEIGHT_RATIO, samplesPerSample, degreesPerSample;
var analyser, audio, audioContext, source, gainNode, maxMagnitude, c, ctx;
var circles = [];
var baseAngle = 0;

var settings = {
	barWidth: 1,
	samples: 100,
	lineWidth: 1,
	bgAlpha: 1,
	hue: 0
};

var mouse = {
	x: null,
	y: null
};

window.addEventListener('load', init, false);
document.addEventListener('mousemove', mouseMove, false);
document.addEventListener('mousedown', mouseDown, false);
document.addEventListener('mouseup', mouseUp, false);

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

	samplesPerSample = Math.floor(1024 / settings.samples);
	degreesPerSample = 360 / settings.samples;

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

	// MUTE DURING DEV MODE
	
	// Create a gain node.
	gainNode = audioContext.createGainNode();
	// Connect the source to the gain node.
	source.connect(gainNode);
	// Connect the gain node to the destination.
	gainNode.connect(audioContext.destination);
	gainNode.gain.value = -1;
	
	// END MUTE

	analyser.connect(audioContext.destination);

	audio.play();
}

function draw() {

	var strength, angle, angleInc, temp, side1, side2, totalMagnitude;

	var x = mouse.x;
	var y = mouse.y;

	webkitRequestAnimationFrame(draw);

	stats.update();

	var freqByteData = new Uint8Array(analyser.frequencyBinCount);

	analyser.getByteFrequencyData(freqByteData);

	ctx.fillStyle = 'rgba(0, 0, 0, ' + settings.bgAlpha + ')';
	ctx.fillRect(0, 0, WIDTH, HEIGHT);
	ctx.lineWidth = settings.lineWidth;
	ctx.strokeStyle = 'hsla(' + settings.hue + ', 50%, 50%, 0.1)';
	ctx.beginPath();

	for (var i = 0; i < 1024; i += samplesPerSample) {
		strength = (freqByteData[i] * HEIGHT_RATIO) * 2;
		
		angle = baseAngle + ((i / 1024) * 360);

		for (j = 0; j < settings.samples; j++) {
			angle += degreesPerSample * j;
			temp = toRadians(angle);

			side1 = Math.sin(temp) * strength;
			side2 = Math.cos(temp) * strength;

			ctx.moveTo(x, y);
			ctx.lineTo((x - side1), (y - side2));
		}


	}

	ctx.stroke();

	// baseAngle += 0.1;

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

function mouseDown() {
	settings.bgAlpha = 0.05;
}

function mouseUp() {
	settings.bgAlpha = 0.5;
}

function toRadians(degrees) {
	return degrees*(Math.PI/180);
}

function randomFromInterval(from, to) {
	return Math.floor(Math.random() * (to - from+ 1 ) + from);
}