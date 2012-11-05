// stats
var stats = new Stats();
stats.setMode(0);
stats.domElement.style.position = 'absolute';
stats.domElement.style.right = '0px';
stats.domElement.style.top = '0px';
stats.domElement.style.zIndex = '10';
document.body.appendChild( stats.domElement );

var winWidth, winHeight, halfWinHeight, widthRatio, heightRatio, analyser, audio, audioContext, source, maxMagnitude, c, ctx;

var settings = {
	barWidth: 1
};

window.addEventListener('load', init, false);

window.onresize = function() {
	winWidth = window.innerWidth;
	winHeight = window.innerHeight;

	halfWinHeight = winHeight / 2;

	widthRatio = winWidth / 1024;
	heightRatio = winHeight / 255;

	c.width = winWidth;
	c.height = winHeight;
};

function init() {
	winWidth = window.innerWidth;
	winHeight = window.innerHeight;

	halfWinHeight = winHeight / 2;

	widthRatio = winWidth / 1024;
	heightRatio = winHeight / 255;

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
	analyser.connect(audioContext.destination);

	audio.play();
}

function draw() {

	var strength, hue;

	webkitRequestAnimationFrame(draw);

	stats.update();

	var freqByteData = new Uint8Array(analyser.frequencyBinCount);

	analyser.getByteFrequencyData(freqByteData);

	ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
	ctx.fillRect(0, 0, winWidth, winHeight);

	for (var i = 0; i < 1024; i += settings.barWidth) {
		strength = (freqByteData[i] * heightRatio) / 2;
		hue = (i / 1024) * 360;

		ctx.fillStyle = 'hsla(' + hue + ', 50%, 50%, 0.8)';
		ctx.fillRect((widthRatio * i), (halfWinHeight - (strength / 1)), (widthRatio * settings.barWidth), (strength * 2));
	}

}

function createCanvas() {
	c = document.createElement('canvas');
	ctx = c.getContext('2d');
	c.width = winWidth;
	c.height = winHeight;
	c.style.position = 'absolute';
	c.style.top = 0;
	c.style.left = 0;
	
	document.body.appendChild(c);
}