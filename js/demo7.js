// stats
var stats = new Stats();
stats.setMode(0);
stats.domElement.style.position = 'absolute';
stats.domElement.style.left = '0px';
stats.domElement.style.top = '0px';
stats.domElement.style.zIndex = '10';
document.body.appendChild( stats.domElement );

var WIDTH, HEIGHT, HALF_WIDTH, HALF_HEIGHT, ASPECT_RATIO, WIDTH_RATIO, HEIGHT_RATIO;
var analyser, audio, audioContext, source, gainNode, maxMagnitude, c, ctx;

// NOTE this is really 1024, but in the mp3 being used the range doesn't really get
// past like 600, so looks a bit shit, so just use the data up to 600 only
var freqRange = 600;

var settings = {
	bars: 200,
	hue: 200
};

window.onload = function() {
  init();
  var gui = new dat.GUI();
  gui.add(settings, 'bars', 10, freqRange);
  gui.add(settings, 'hue', 0, 360);
};

window.onresize = function() {
	WIDTH = window.innerWidth;
	HEIGHT = window.innerHeight;
	HALF_WIDTH = WIDTH / 2;
	HALF_HEIGHT = HEIGHT / 2;
	ASPECT_RATIO = HEIGHT / WIDTH;

	WIDTH_RATIO = WIDTH / freqRange;
	HEIGHT_RATIO = HEIGHT / 255;

	maxMagnitude = freqRange * 255;

	c.width = WIDTH;
	c.height = HEIGHT;
};

function init() {
	WIDTH = window.innerWidth;
	HEIGHT = window.innerHeight;
	HALF_WIDTH = WIDTH / 2;
	HALF_HEIGHT = HEIGHT / 2;
	ASPECT_RATIO = HEIGHT / WIDTH;

	WIDTH_RATIO = WIDTH / freqRange;
	HEIGHT_RATIO = HEIGHT / 255;

	maxMagnitude = freqRange * 255;

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
	
	// // Create a gain node.
	// gainNode = audioContext.createGainNode();
	// // Connect the source to the gain node.
	// source.connect(gainNode);
	// // Connect the gain node to the destination.
	// gainNode.connect(audioContext.destination);
	// gainNode.gain.value = 0;
	
	// END MUTE

	analyser.connect(audioContext.destination);

	audio.play();
}

function draw() {

	var strength, trueIndex, totalMagnitude;

	var freqInc = Math.round(freqRange / settings.bars);
	var barWidth = Math.round(WIDTH / settings.bars);
	var lightnessInc = Math.round(40 / settings.bars);
	var hue = settings.hue;

	webkitRequestAnimationFrame(draw);

	stats.update();

	var freqByteData = new Uint8Array(analyser.frequencyBinCount);

	analyser.getByteFrequencyData(freqByteData);

	ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
	ctx.fillRect(0, 0, WIDTH, HEIGHT);

	for (var i = 0; i <= freqRange; i += freqInc) {
		trueIndex = i / freqInc;
		strength = Math.round(freqByteData[i] / 255);

		ctx.fillStyle = 'hsla(' + hue + ', ' + (30 + (strength * 70)) + '%, 50%, ' + strength + ')';
		ctx.fillRect((trueIndex * barWidth), 0, barWidth, HEIGHT);

		hue++;
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

function randomFromInterval(from, to) {
	return Math.floor(Math.random() * (to - from+ 1 ) + from);
}