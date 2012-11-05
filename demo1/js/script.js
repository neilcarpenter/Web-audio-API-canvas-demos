// stats
var stats = new Stats();
stats.setMode(0);
stats.domElement.style.position = 'absolute';
stats.domElement.style.right = '0px';
stats.domElement.style.top = '0px';
stats.domElement.style.zIndex = '10';
document.body.appendChild( stats.domElement );

var winWidth, winHeight, widthRatio, heightRatio, analyser, audio, audioContext, source, maxMagnitude, c, ctx, c2, ctx2;

var settings = {
	barWidth: 20
};

window.addEventListener('load', init, false);

window.onresize = function() {
	winWidth = window.innerWidth;
	winHeight = window.innerHeight;

	widthRatio = winWidth / 1024;
	heightRatio = winHeight / 255;

	c.width = winWidth;
	c.height = winHeight;

	c2.width = winWidth;
	c2.height = winHeight;
};

function init() {
	winWidth = window.innerWidth;
	winHeight = window.innerHeight;

	widthRatio = winWidth / 1024;
	heightRatio = winHeight / 255;

	maxMagnitude = 1024 * 255;

	setupWebAudio();
	setupDrawingCanvas();
	draw();
}

// Wire up the <audio> element with the Web Audio analyser (currently Webkit only)
function setupWebAudio() {
	// Get our <audio> element
	audio = document.getElementById('music');
	// Create a new audio context (that allows us to do all the Web Audio stuff)
	audioContext = new webkitAudioContext();
	// Create a new analyser
	analyser = audioContext.createAnalyser();
	// Create a new audio source from the <audio> element
	source = audioContext.createMediaElementSource(audio);
	// Connect up the output from the audio source to the input of the analyser
	source.connect(analyser);
	// Connect up the audio output of the analyser to the audioContext destination i.e. the speakers (The analyser takes the output of the <audio> element and swallows it. If we want to hear the sound of the <audio> element then we need to re-route the analyser's output to the speakers)
	analyser.connect(audioContext.destination);

	// Get the <audio> element started
	audio.play();
}

// Draw the audio frequencies to screen
function draw() {

	var strength, saturation, rand, totalMagnitude, shadowStrength;

	// Setup the next frame of the drawing
	webkitRequestAnimationFrame(draw);

	stats.update();

	// Create a new array that we can copy the frequency data into
	var freqByteData = new Uint8Array(analyser.frequencyBinCount);
	// Copy the frequency data into our new array
	analyser.getByteFrequencyData(freqByteData);

	// ctx.globalAlpha = 0.2;
	// ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
	ctx.clearRect(0, 0, winWidth, winHeight);

	// For each "bucket" in the frequency data, draw a line corresponding to its magnitude
	for (var i = 0; i < 1024; i += settings.barWidth) {
		strength = freqByteData[i] * heightRatio;
		alpha = strength / winHeight;
		saturation = (strength / winHeight) * 100;

		ctx.fillStyle = 'hsla(0, 50%, 50%, ' + (alpha / 3) + ')';
		ctx.fillRect((widthRatio * i), (winHeight - strength), (widthRatio * settings.barWidth), strength);
	}

	ctx2.clearRect(0, 0, winWidth, winHeight);
	ctx2.lineWidth = 1;

	for (var k = 0; k < 3; k++) {
		ctx2.beginPath();
		totalMagnitude = 0;
		for (var j = 0; j < 1024; j += 1) {
			rand = randomFromInterval(-k, k);
			strength = freqByteData[j] * heightRatio;
			ctx2.lineTo(((widthRatio * j) + (settings.barWidth / 2)), (winHeight - strength + (rand * 10)));

			if (k === 0) {
				totalMagnitude += freqByteData[j];
			}
		}

		if (k === 0) {
			shadowStrength = 1024 / settings.barWidth;
			shadowStrength = shadowStrength * (totalMagnitude / maxMagnitude);

			ctx2.shadowOffsetX = 0;
			ctx2.shadowOffsetY = 0;
			// ctx2.shadowBlur = shadowStrength * 20;
			ctx2.shadowBlur = 0;
			ctx2.shadowColor = 'hsl(0, 50%, 50%)';

			ctx2.strokeStyle = 'hsla(0, ' + (shadowStrength * 100) + '%, 50%, 1)';
		}
		else {
			ctx2.shadowBlur = 0;
			ctx2.strokeStyle = 'rgba(255, 255, 255, 0.3)';
		}

		ctx2.stroke();
	}
}

// Basic setup for the canvas element, so we can draw something on screen
// 1024 is the number of samples that's available in the frequency data
// 255 is the maximum magnitude of a value in the frequency data
function setupDrawingCanvas() {
	c = document.createElement('canvas');
	ctx = c.getContext('2d');
	c.width = winWidth;
	c.height = winHeight;
	c.style.position = 'absolute';
	c.style.top = 0;
	c.style.left = 0;

	c2 = document.createElement('canvas');
	ctx2 = c2.getContext('2d');
	c2.width = winWidth;
	c2.height = winHeight;
	c2.style.position = 'absolute';
	c2.style.top = 0;
	c2.style.left = 0;
	
	document.body.appendChild(c);
	document.body.appendChild(c2);
}

function randomFromInterval(from, to) {
	return Math.floor(Math.random() * (to - from+ 1 ) + from);
}