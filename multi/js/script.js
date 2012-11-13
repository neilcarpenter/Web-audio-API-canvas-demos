// Web Audio API + canvas visualisation things
// https://github.com/neilcarpenter/Web-audio-API-canvas-demos
// @neilcarpenter

// Code has been cobbled together from different experiments for each
// effect so isn't very well organised, whoops!

// stats
var stats = new Stats();
stats.setMode(0);
stats.domElement.style.position = 'absolute';
stats.domElement.style.left = '0px';
stats.domElement.style.top = '0px';
stats.domElement.style.zIndex = '10';
document.body.appendChild( stats.domElement );

// set up some stuff
var WIDTH, HEIGHT, HALF_WIDTH, HALF_HEIGHT, ASPECT_RATIO, WIDTH_RATIO, HEIGHT_RATIO;
var analyser, freqByteData, audio, audioContext, source, gainNode, maxMagnitude, c, ctx;

// circlesThree effect only
var circles = [];

// spikes effect only
var samplesPerSample, degreesPerSample, baseAngle = 0;

// GUIs - tried to add some better transitions when changing between effects but then gave up
var GUIs = [];
var gui, circlesOneGUI, circlesTwoGUI, circlesThreeGUI, spikesGUI, barsGUI;

var effects = {
	activeEffect: 'spikes',
	names: [ 'circlesOne', 'circlesTwo', 'circlesThree', 'spikes', 'bars' ]
};

var mouse = { x: 0, y: 0 };

var settings = {
	'circlesOne': {
		circles: 30,
		hue: 0,
		offset: {
			x: 10,
			y: 10
		}
	},
	'circlesTwo': {
		circles: 30,
		hue: 0
	},
	'circlesThree': {
		circles: 40,
		maxCircles: 100,
		hue: 0
	},
	'spikes': {
		samples: 100,
		lineWidth: 1,
		bgAlpha: 1,
		hue: 0
	},
	'bars': {
		bars: 200,
		hue: 200
	}
};

window.onload = function() {
	init();
	c.addEventListener('mousemove', mouseMove, false);
	c.addEventListener('mousedown', mouseDown, false);
	c.addEventListener('mouseup', mouseUp, false);

	gui = new dat.GUI();
	var effectsController = gui.add(effects, 'activeEffect',  effects.names);
	effectsController.onChange(function(value) {
		for (var i = 0; i < GUIs.length; i++) {
			if (GUIs[i].domElement.id == value) {
				GUIs[i].open();
			} else {
				GUIs[i].close();
			}
		}
	});

	// circlesOne
	circlesOneGUI = gui.addFolder('Circles one');
	circlesOneGUI.add(settings.circlesOne, 'circles', 1, 100);
	circlesOneGUI.domElement.id = 'circlesOne';
	GUIs.push(circlesOneGUI);
	// circlesTwo
	circlesTwoGUI = gui.addFolder('Circles two');
	circlesTwoGUI.add(settings.circlesTwo, 'circles', 1, 100);
	circlesTwoGUI.domElement.id = 'circlesTwo';
	GUIs.push(circlesTwoGUI);
	// circlesThree
	circlesThreeGUI = gui.addFolder('Circles three');
	circlesThreeGUI.add(settings.circlesThree, 'circles', 1, 100);
	circlesThreeGUI.domElement.id = 'circlesThree';
	GUIs.push(circlesThreeGUI);
	// spikes
	spikesGUI = gui.addFolder('Spikes');
	spikesGUI.add(settings.spikes, 'lineWidth', 0.1, 1);
	spikesGUI.domElement.id = 'spikes';
	spikesGUI.open();
	GUIs.push(spikesGUI);
	// bars
	barsGUI = gui.addFolder('Bars');
	barsGUI.add(settings.bars, 'bars', 10, 600);
	barsGUI.add(settings.bars, 'hue', 0, 360);
	barsGUI.domElement.id = 'bars';
	GUIs.push(barsGUI);
};

window.onresize = function() {
	WIDTH = window.innerWidth;
	HEIGHT = window.innerHeight;
	HALF_WIDTH = WIDTH / 2;
	HALF_HEIGHT = HEIGHT / 2;
	ASPECT_RATIO = HEIGHT / WIDTH;

	WIDTH_RATIO = WIDTH / 600;
	HEIGHT_RATIO = HEIGHT / 255;

	maxMagnitude = 600 * 255;

	c.width = WIDTH;
	c.height = HEIGHT;
};

function init() {
	WIDTH = window.innerWidth;
	HEIGHT = window.innerHeight;
	HALF_WIDTH = WIDTH / 2;
	HALF_HEIGHT = HEIGHT / 2;
	ASPECT_RATIO = HEIGHT / WIDTH;

	WIDTH_RATIO = WIDTH / 600;
	HEIGHT_RATIO = HEIGHT / 255;

	maxMagnitude = 600 * 255;

	samplesPerSample = Math.floor(1024 / settings.spikes.samples);
	degreesPerSample = 360 / settings.spikes.samples;

	setupWebAudio();
	createCanvas();
	loop();
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
	// gainNode.gain.value = -1;
	
	// END MUTER

	analyser.connect(audioContext.destination);

	audio.play();
}

function loop() {

	webkitRequestAnimationFrame(loop);

	stats.update();

	freqByteData = new Uint8Array(analyser.frequencyBinCount);

	analyser.getByteFrequencyData(freqByteData);

    switch (effects.activeEffect) {
        case 'circlesOne':
            drawCirclesOne();
            break;
        case 'circlesTwo':
            drawCirclesTwo();
            break;
        case 'circlesThree':
            drawCirclesThree();
            break;
        case 'spikes':
            drawSpikes();
            break;
        case 'bars':
            drawBars();
            break;
        default:
            // ARGH
        break;
    }
}

function drawCirclesOne() {

	var totals = [], ratio, strength, totalMagnitude, circleOffSetX, circleOffSetY, circleOffSet;

	ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
	ctx.fillRect(0, 0, WIDTH, HEIGHT);

	totalMagnitude = 0;

	for (var i = 0; i < settings.circlesOne.circles; i += 1) {

		totals[i] = {'magnitude': 0};

		for (var j = 0; j < (1024 / (i+1)); j += 1) {

			totals[i].magnitude += freqByteData[j];

		}

		totals[i].ratio = totals[i].magnitude / (maxMagnitude / settings.circlesOne.circles);
		totals[i].strength = totals[i].ratio * HEIGHT / settings.circlesOne.circles;

		circleOffSetX = totals[i].ratio * settings.circlesOne.offset.x;
		circleOffSetX = settings.circlesOne.offset.x - circleOffSetX;
		circleOffSetY = totals[i].ratio * settings.circlesOne.offset.y;
		circleOffSetY = settings.circlesOne.offset.y - circleOffSetY;

		ctx.strokeStyle = 'hsla(' + settings.circlesOne.hue + ', 50%, 50%, ' + ((1 / settings.circlesOne.circles) + 0.1) + ')';
		ctx.fillStyle = 'hsla(' + settings.circlesOne.hue + ', 50%, 50%, ' + (1 / settings.circlesOne.circles) + ')';
		ctx.beginPath();
		ctx.arc((WIDTH / 2 - circleOffSetX) ,(HEIGHT / 2 - circleOffSetY), totals[i].strength, 0, Math.PI*2, true);
		ctx.stroke();
		ctx.fill();

		totalMagnitude += totals[i].magnitude;
		
	}

	ratio = totalMagnitude / maxMagnitude;
	ctx.fillStyle = 'hsla(' + settings.circlesOne.hue + ', 50%, 50%, ' + (0.03 * ratio) + ')';
	ctx.fillRect(0, 0, WIDTH, HEIGHT);
}

function drawCirclesTwo() {

	var totals = [], ratio, strength, totalMagnitude;

	ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
	ctx.fillRect(0, 0, WIDTH, HEIGHT);

	totalMagnitude = 0;

	for (var i = 0; i < settings.circlesTwo.circles; i += 1) {

		totals[i] = {'magnitude': 0};

		for (var j = 0; j < (1024 / (i+1)); j += 1) {

			totals[i].magnitude += freqByteData[j];

		}

		totals[i].ratio = totals[i].magnitude / (maxMagnitude / settings.circlesTwo.circles);
		totals[i].strength = totals[i].ratio * HEIGHT / settings.circlesTwo.circles;

		ctx.strokeStyle = 'hsla(' + settings.circlesTwo.hue + ', 50%, 50%, ' + ((1 / settings.circlesTwo.circles) + 0.1) + ')';
		ctx.fillStyle = 'hsla(' + settings.circlesTwo.hue + ', 50%, 50%, ' + (1 / settings.circlesTwo.circles) + ')';
		ctx.beginPath();
		ctx.arc(mouse.x ,mouse.y, totals[i].strength, 0, Math.PI*2, true);
		ctx.stroke();
		ctx.fill();

		totalMagnitude += totals[i].magnitude;
		
	}

	ratio = totalMagnitude / maxMagnitude;
	ctx.fillStyle = 'hsla(' + settings.circlesTwo.hue + ', 50%, 50%, ' + (0.005 * ratio) + ')';
	ctx.fillRect(0, 0, WIDTH, HEIGHT);
}

function drawCirclesThree() {

	// this only happens once
	if (!circles.length) {
		for (var k = 0; k < settings.circlesThree.maxCircles; k++) {
			circles[k] = {
				'x': randomFromInterval(0, WIDTH),
				'y': randomFromInterval(0, HEIGHT)
			};
		}
	}

	var x, y, ratio, strength, totalMagnitude;

	ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
	ctx.fillRect(0, 0, WIDTH, HEIGHT);

	totalMagnitude = 0;

	for (var i = 0; i < settings.circlesThree.circles; i += 1) {

		circles[i].magnitude = 0;

		for (var j = 0; j < (1024 / (i+1)); j += 1) {

			circles[i].magnitude += freqByteData[j];

		}

		circles[i].ratio = circles[i].magnitude / (maxMagnitude / settings.circlesThree.circles);
		circles[i].strength = circles[i].ratio * HEIGHT / settings.circlesThree.circles;

		ctx.strokeStyle = 'hsla(' + settings.circlesThree.hue + ', 50%, 50%, ' + ((1 / settings.circlesThree.circles) + 0.15) + ')';
		ctx.fillStyle = 'hsla(' + settings.circlesThree.hue + ', 50%, 50%, ' + ((1 / settings.circlesThree.circles) + 0.05) + ')';
		ctx.beginPath();
		ctx.arc(circles[i].x ,circles[i].y, circles[i].strength, 0, Math.PI*2, true);
		ctx.stroke();
		ctx.fill();

		totalMagnitude += circles[i].magnitude;
		
	}

	ratio = totalMagnitude / maxMagnitude;
	ctx.fillStyle = 'hsla(' + settings.circlesThree.hue + ', 50%, 50%, ' + (0.04 * ratio) + ')';
	ctx.fillRect(0, 0, WIDTH, HEIGHT);
}

function drawSpikes() {

	var strength, angle, angleInc, temp, side1, side2, totalMagnitude;

	var x = mouse.x;
	var y = mouse.y;

	ctx.fillStyle = 'rgba(0, 0, 0, ' + settings.spikes.bgAlpha + ')';
	ctx.fillRect(0, 0, WIDTH, HEIGHT);
	ctx.lineWidth = settings.spikes.lineWidth;
	ctx.strokeStyle = 'hsla(' + settings.spikes.hue + ', 50%, 50%, 0.1)';
	ctx.beginPath();

	for (var i = 0; i < 1024; i += samplesPerSample) {
		strength = (freqByteData[i] * HEIGHT_RATIO) * 2;
		
		angle = baseAngle + ((i / 1024) * 360);

		for (j = 0; j < settings.spikes.samples; j++) {
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

function drawBars() {
	var strength, trueIndex, totalMagnitude;

	var freqInc = Math.round(600 / settings.bars.bars);
	var barWidth = Math.round(WIDTH / settings.bars.bars);
	var lightnessInc = Math.round(40 / settings.bars.bars);
	var hue = settings.bars.hue;

	ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
	ctx.fillRect(0, 0, WIDTH, HEIGHT);

	for (var i = 0; i <= 600; i += freqInc) {
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

function mouseMove(e) {
	var x = mouse.x = e.offsetX;
	var y = mouse.y = e.offsetY;

	// circlesOne
	settings.circlesOne.hue = (x / WIDTH * 180) + (y / HEIGHT * 180);
	settings.circlesOne.offset.x = ((x - HALF_WIDTH) / HALF_WIDTH) * 50;
	settings.circlesOne.offset.y = ((y - HALF_HEIGHT) / HALF_HEIGHT) * (50 * ASPECT_RATIO);

	// circlesTwo / circlesThree / spikes
	settings.circlesTwo.hue = settings.circlesThree.hue = settings.spikes.hue = (mouse.x / WIDTH * 180) + (mouse.y / HEIGHT * 180);
}

function mouseDown() {
	settings.spikes.bgAlpha = 0.05;
}

function mouseUp() {
	settings.spikes.bgAlpha = 0.5;
}

// helper funcs
function toRadians(degrees) {
	return degrees*(Math.PI/180);
}

function randomFromInterval(from, to) {
	return Math.floor(Math.random() * (to - from+ 1 ) + from);
}