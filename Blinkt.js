var wpi = require('wiring-pi'),
	DAT = 23,
	CLK = 24,
	Blinkt;

Blinkt = function () {};

Blinkt.prototype.setup = function setup () {
	// Set WPI to GPIO mode
	wpi.setup('gpio');

	// Set pin mode to output
	wpi.pinMode(DAT, wpi.OUTPUT);
	wpi.pinMode(CLK, wpi.OUTPUT);

	this._numPixels = 8;
	this._pixels = [];

	// Init pixels
	for (var i = 0; i < this._numPixels; i++) {
		this.setPixel(i, 255, 255, 255, 1.0);
	}
};

Blinkt.prototype.setAllPixels = function setAllPixels (r, g, b, a) {
	for (var i = 0; i < this._numPixels; i++) {
		this.setPixel(i, r, g, b, a);
	}
};

Blinkt.prototype.setPixel = function setPixel (pixelNum, r, g, b, a) {
	if (a === undefined) {
		if (this._pixels[pixelNum]) {
			// Set a to current level or 1.0 if none exists
			a = this._pixels[pixelNum][3] !== undefined ? this._pixels[pixelNum][3] : 1.0;
		}
	} else {
		a = parseInt((31.0 * a), 10) & 0b11111;
	}

	this._pixels[pixelNum] = [
		parseInt(r, 10) & 255,
		parseInt(g, 10) & 255,
		parseInt(b, 10) & 255,
		a
	];
};

Blinkt.prototype.setBrightness = function setBrightness (pixelNum, brightness) {
	this._pixels[pixelNum][3] = parseInt((31.0 * brightness), 10) & 0b11111;
};

Blinkt.prototype.clearAll = function clearAll () {
	for (var i = 0; i < this._numPixels; i++) {
		this.setPixel(i, 255, 255, 255);
	}
};

Blinkt.prototype.sendUpdate = function sendUpdate () {
	var i,
		pixel;

	for (i = 0; i < 4; i++) {
		this._writeByte(0);
	}

	for (i = 0; i < this._numPixels; i++) {
		pixel = this._pixels[i];

		this._writeByte(0b11100000 | pixel[3]); // a
		this._writeByte(pixel[2]); // b
		this._writeByte(pixel[1]); // g
		this._writeByte(pixel[0]); // r
	}

	this._writeByte(0xff);
};

Blinkt.prototype._writeByte = function writeByte (byte) {
	var bit;

	for (var i = 0 ; i < this._numPixels; i++) {
		bit = ((byte & (1 << (7 - i))) > 0) === true ? wpi.HIGH : wpi.LOW;

		wpi.digitalWrite(DAT, bit);
		wpi.digitalWrite(CLK, 1);
		wpi.digitalWrite(CLK, 0);
	}
};

module.exports = Blinkt;