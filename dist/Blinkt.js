"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var wpi = require("node-wiring-pi"),
    DAT = 23,
    CLK = 24;

var Blinkt = function Blinkt() {
  var _this = this;

  (0, _classCallCheck2["default"])(this, Blinkt);
  (0, _defineProperty2["default"])(this, "brightnessMask", 0x1F);
  (0, _defineProperty2["default"])(this, "significantBitsMask", 0xE0);
  (0, _defineProperty2["default"])(this, "setup", function (dat, clk) {
    // Set WPI to GPIO mode
    wpi.setup("gpio");

    if (Boolean(dat) && isNaN(dat)) {
      //if dat has value and is not a number
      throw new Error("The dat value must be a pin number");
    }

    if (Boolean(clk) && isNaN(clk)) {
      //if clk has value and is not a number
      throw new Error("The clk value must be a pin number");
    }

    _this._dat = dat || DAT;
    _this._clk = clk || CLK; // Set pin mode to output

    wpi.pinMode(_this._dat, wpi.OUTPUT);
    wpi.pinMode(_this._clk, wpi.OUTPUT);
    _this._numPixels = 8;
    _this._pixels = []; // Init pixels

    for (var i = 0; i < _this._numPixels; i++) {
      _this.setPixel(i, 255, 255, 255, 1.0);
    }
  });
  (0, _defineProperty2["default"])(this, "setAllPixels", function (r, g, b, a) {
    for (var i = 0; i < _this._numPixels; i++) {
      _this.setPixel(i, r, g, b, a);
    }
  });
  (0, _defineProperty2["default"])(this, "setPixel", function (pixelNum, r, g, b, a) {
    if (a === undefined) {
      if (_this._pixels[pixelNum]) {
        // Set a to current level or 1.0 if none exists
        a = _this._pixels[pixelNum][3] !== undefined ? _this._pixels[pixelNum][3] : 1.0;
      }
    } else {
      a = Math.floor(31.0 * a) & _this.brightnessMask; // jshint ignore:line
    }

    _this._pixels[pixelNum] = [Math.floor(r) & 255, // jshint ignore:line
    Math.floor(g) & 255, // jshint ignore:line
    Math.floor(b) & 255, // jshint ignore:line
    a];
  });
  (0, _defineProperty2["default"])(this, "setBrightness", function (pixelNum, brightness) {
    _this._pixels[pixelNum][3] = Math.floor(31.0 * brightness) & _this.brightnessMask; // jshint ignore:line
  });
  (0, _defineProperty2["default"])(this, "clearAll", function () {
    for (var i = 0; i < _this._numPixels; i++) {
      _this.clear(i);
    }
  });
  (0, _defineProperty2["default"])(this, "clear", function (led) {
    _this.setPixel(led, 0, 0, 0);
  });
  (0, _defineProperty2["default"])(this, "sendUpdate", function () {
    var i, pixel;

    for (i = 0; i < 4; i++) {
      _this._writeByte(0);
    }

    for (i = 0; i < _this._numPixels; i++) {
      pixel = _this._pixels[i]; // Brightness

      _this._writeByte(_this.significantBitsMask | pixel[3]); // jshint ignore:line
      // Blue


      _this._writeByte(pixel[2]); // Green


      _this._writeByte(pixel[1]); // Red


      _this._writeByte(pixel[0]);
    }

    _this._writeByte(0xff);

    _this._latch();
  });
  (0, _defineProperty2["default"])(this, "_writeByte", function (_byte) {
    var bit;

    for (var i = 0; i < _this._numPixels; i++) {
      bit = (_byte & 1 << 7 - i) > 0 ? wpi.HIGH : wpi.LOW; // jshint ignore:line

      wpi.digitalWrite(_this._dat, bit);
      wpi.digitalWrite(_this._clk, 1);
      wpi.digitalWrite(_this._clk, 0);
    }
  });
  (0, _defineProperty2["default"])(this, "_latch", function () {
    wpi.digitalWrite(_this._dat, 0);

    for (var i = 0; i < 36; i++) {
      wpi.digitalWrite(_this._clk, 1);
      wpi.digitalWrite(_this._clk, 0);
    }
  });
};

module.exports = Blinkt;