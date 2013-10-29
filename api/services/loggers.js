var nr = require('newrelic');
var dgram = require('dgram');
//var message = new Buffer("Some bytes");
var client = dgram.createSocket('udp4');




exports.newrelic = require('newrelic/lib/logger').child({component : 'mapsNode'});
	
		
exports.udp = function(message) {
	var message = new Buffer(message);
	
	client.on("error", function (err) {
	    console.log("Error logging socket: " + err);
	    client.close(); 
	    client = dgram.createSocket('udp4');
	});
	client.send(message, 0, message.length, 32091, "10.1.1.107", function(err, bytes) {
		if (err) console.log("errro logging");
		console.log('UDP message sent to ' + "10.1.1.107" +':'+ 32091 + ' ' + bytes);
	});
};
		
