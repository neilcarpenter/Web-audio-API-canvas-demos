// stats
var stats = new Stats();
stats.setMode(0);
stats.domElement.style.position = 'absolute';
stats.domElement.style.right = '0px';
stats.domElement.style.top = '0px';
stats.domElement.style.zIndex = '10';
document.body.appendChild( stats.domElement );

var WIDTH, HEIGHT, HALF_WIDTH, HALF_HEIGHT, ASPECT_RATIO, WIDTH_RATIO, HEIGHT_RATIO;
var analyser, audio, audioContext, source, gainNode, maxMagnitude, c, ctx;

var settings = {
	saturation: 0
};

var mouse = {
	x: 0,
	y: 0
};

window.onload = init;
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

	// MUTE DURING DEV MODE
	
	// Create a gain node.
	gainNode = audioContext.createGainNode();
	// Connect the source to the gain node.
	source.connect(gainNode);
	// Connect the gain node to the destination.
	gainNode.connect(audioContext.destination);
	gainNode.gain.value = 0;
	
	// END MUTE

	analyser.connect(audioContext.destination);

	audio.play();
}

function draw() {

	var strength, x1, x2, lowerRange, upperRange, totalMagnitude;

	webkitRequestAnimationFrame(draw);

	stats.update();

	var freqByteData = new Uint8Array(analyser.frequencyBinCount);

	analyser.getByteFrequencyData(freqByteData);

	ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
	ctx.fillRect(0, 0, WIDTH, HEIGHT);

	for (var i = 0; i < 1024; i++) {
		strength = freqByteData[i] / 255;
		x1 = i * WIDTH_RATIO / 2;
		x2 = WIDTH - (i * WIDTH_RATIO / 2);
		lowerRange = mouse.x - 5;
		upperRange = mouse.x + 5;

		if (x1 > lowerRange && x1 < upperRange || x2 > lowerRange && x2 < upperRange) {
			settings.saturation = 100;
		} else {
			settings.saturation = 0;
		}

		// ctx.fillStyle = '#0D0D0D';
		ctx.fillStyle = 'hsla(0, ' + settings.saturation + '%, 50%, ' + (strength / 10) + ')';
		
		for (var j = 1; j < 3; j++) {
			if (j === 1) {
				ctx.fillRect(x1, 0, WIDTH_RATIO, HEIGHT);
			} else {
				ctx.fillRect(x2, 0, WIDTH_RATIO, HEIGHT);
			}
		}
	}

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
}

function randomFromInterval(from, to) {
	return Math.floor(Math.random() * (to - from+ 1 ) + from);
}