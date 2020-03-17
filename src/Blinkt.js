const wpi = require("node-wiring-pi"),
	DAT = 23,
	CLK = 24;

class Blinkt {
	brightnessMask = 0x1F; // 0b11111
	significantBitsMask = 0xE0; //0b11100000
	
	/**
	 * Connects to the GPIO and sets the GPIO pin modes. Must be called
	 * before any other commands. All pixels will start off white at
	 * full brightness by default.
	 * @param {Number} dat The data pin number.
	 * @param {Number} clk The clock pin number.
	 * @returns {undefined} Nothing.
	 */
	setup = (dat, clk) => {
		// Set WPI to GPIO mode
		wpi.setup("gpio");
		
		if(Boolean(dat) && isNaN(dat)){
			//if dat has value and is not a number
			throw new Error("The dat value must be a pin number");
		}
		
		if(Boolean(clk) && isNaN(clk)){
			//if clk has value and is not a number
			throw new Error("The clk value must be a pin number");
		}
		
		this._dat = dat || DAT;
		this._clk = clk || CLK;
		
		// Set pin mode to output
		wpi.pinMode(this._dat, wpi.OUTPUT);
		wpi.pinMode(this._clk, wpi.OUTPUT);
		
		this._numPixels = 8;
		this._pixels = [];
		
		// Init pixels
		for (let i = 0; i < this._numPixels; i++) {
			this.setPixel(i, 255, 255, 255, 1.0);
		}
	};
	
	/**
	 * Sets all pixels to the passed RGB and brightness values.
	 * @param {Number} r The pixel red value between 0 and 255.
	 * @param {Number} g The pixel green value between 0 and 255.
	 * @param {Number} b The pixel blue value between 0 and 255.
	 * @param {Number} a The pixel brightness value between 0.0 and 1.0.
	 * @returns {undefined} Nothing.
	 */
	setAllPixels = (r, g, b, a) => {
		for (let i = 0; i < this._numPixels; i++) {
			this.setPixel(i, r, g, b, a);
		}
	};
	
	/**
	 * Sets the specified pixel to the passed rgb and brightness level.
	 * The pixelNum is an integer between 0 and 7 to indicate the pixel
	 * to change.
	 * @param {Number} pixelNum The pixel to set RGB and brightness for.
	 * An integer value between 0 and 7. Zero is the first pixel, 7 is
	 * the last one.
	 * @param {Number} r The pixel red value between 0 and 255.
	 * @param {Number} g The pixel green value between 0 and 255.
	 * @param {Number} b The pixel blue value between 0 and 255.
	 * @param {Number=} a The pixel brightness value between 0.0 and 1.0.
	 * @returns {undefined} Nothing.
	 */
	setPixel = (pixelNum, r, g, b, a) => {
		if (a === undefined) {
			if (this._pixels[pixelNum]) {
				// Set a to current level or 1.0 if none exists
				a = this._pixels[pixelNum][3] !== undefined ? this._pixels[pixelNum][3] : 1.0;
			}
		} else {
			a = Math.floor(31.0 * a) & this.brightnessMask; // jshint ignore:line
		}
		
		this._pixels[pixelNum] = [
			Math.floor(r) & 255, // jshint ignore:line
			Math.floor(g) & 255, // jshint ignore:line
			Math.floor(b) & 255, // jshint ignore:line
			a
		];
	};
	
	/**
	 * Sets the brightness of the pixel specified by pixelNum.
	 * @param {Number} pixelNum The pixel to set RGB and brightness for.
	 * An integer value between 0 and 7. Zero is the first pixel, 7 is
	 * the last one.
	 * @param {Number} brightness The pixel brightness value between 0.0
	 * and 1.0.
	 * @returns {undefined} Nothing.
	 */
	setBrightness = (pixelNum, brightness) => {
		this._pixels[pixelNum][3] = Math.floor(31.0 * brightness) & this.brightnessMask; // jshint ignore:line
	};
	
	/**
	 * Clears the pixel buffer.
	 * This is the same as setting all pixels to black.
	 * You must also call sendUpdate() if you want to turn Blinkt! off.
	 * @returns {undefined} Nothing.
	 */
	clearAll = () => {
		for (let i = 0; i < this._numPixels; i++) {
			this.clear(i);
		}
	};
	
	/**
	 * Clears the pixel .
	 * This is the same as setting this pixels to black.
	 * You must also call sendUpdate() if you want to turn Blinkt! off.
	 * @param {Number} led index to clear.
	 * @returns {undefined} Nothing.
	 */
	clear = (led) => {
		this.setPixel(led, 0, 0, 0);
	};
	
	/**
	 * Sends the current pixel settings to the Blinkt! device. Once you
	 * have set each pixel RGB and brightness, you MUST call this for the
	 * pixels to change on the Blinkt! device.
	 * @returns {undefined} Nothing.
	 */
	sendUpdate = () => {
		let i,
			pixel;
		
		for (i = 0; i < 4; i++) {
			this._writeByte(0);
		}
		
		for (i = 0; i < this._numPixels; i++) {
			pixel = this._pixels[i];
			
			// Brightness
			this._writeByte(this.significantBitsMask | pixel[3]); // jshint ignore:line
			// Blue
			this._writeByte(pixel[2]);
			// Green
			this._writeByte(pixel[1]);
			// Red
			this._writeByte(pixel[0]);
		}
		
		this._writeByte(0xff);
		this._latch();
	};
	
	/**
	 * Writes byte data to the GPIO pins.
	 * @param {Number} byte The byte value to write.
	 * @returns {undefined} Nothing.
	 * @private
	 */
	_writeByte = (byte) => {
		let bit;
		
		for (let i = 0 ; i < this._numPixels; i++) {
			bit = ((byte & (1 << (7 - i))) > 0) ? wpi.HIGH : wpi.LOW; // jshint ignore:line
			
			wpi.digitalWrite(this._dat, bit);
			wpi.digitalWrite(this._clk, 1);
			wpi.digitalWrite(this._clk, 0);
		}
	};
	
	/**
	 * Emit exactly enough clock pulses to latch the small dark die APA102s which are weird.
	 * @returns {undefined} Nothing.
	 * @private
	 */
	_latch = () => {
		wpi.digitalWrite(this._dat, 0);
		
		for (let i = 0 ; i < 36; i++) {
			wpi.digitalWrite(this._clk, 1);
			wpi.digitalWrite(this._clk, 0);
		}
	};
}

module.exports = Blinkt;
