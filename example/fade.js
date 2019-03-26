var Blinkt = require('../Blinkt'),
	leds = new Blinkt();

leds.setup();
var r=0, g=0, b=0;
setInterval(function() {
	leds.clearAll();
	leds.setAllPixels((++r)%255, (++g)%255, (++b)%255, 0.1);
	leds.sendUpdate();
} , 10);

