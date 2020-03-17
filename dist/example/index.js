"use strict";

var Blinkt = require('../Blinkt');

var leds = new Blinkt();
leds.setup();
leds.clearAll();
leds.setAllPixels(0, 156, 0, 0.1);
leds.sendUpdate();