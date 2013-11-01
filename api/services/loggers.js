var nr = require('newrelic');
var dgram = require('dgram');
//var message = new Buffer("Some bytes");
var dateFormat = require("dateformat");
var client = dgram.createSocket('udp4');
client.on("error", function (err) {
	console.log("Error logging socket: " + err);
	client.close(); 
	client = dgram.createSocket('udp4');
});


exports.newrelic = require('newrelic/lib/logger').child({component : 'error_rate'});
	
		
exports.udp = {
		log : function(origMessage) {
			var message = new Buffer(origMessage);
			
			client.send(message, 0, message.length, 32096, "10.1.1.107", function(err, bytes) {
				if (err) console.log("error logging UDP");
				console.log(origMessage);
			});
		},
		
		debug : function(message) {
			exports.udp.format(message, "DEBUG", 10);
		},
		trace : function(message) {
			exports.udp.format(message, "TRACE", 20);
		},
		info : function(message) {
			exports.udp.format(message, "INFO", 30);
		},
		warning : function(message) {
			exports.udp.format(message, "WARNING", 40);
		},
		error : function(message) {
			exports.udp.format(message, "ERROR", 50);
		},
		format : function(message, type, level) {
			if (!level || !process.minLogLevel || level >= process.minLogLevel) {
				var text = dateFormat(new Date(), "yyyy-mm-dd HH:MM:ss") + " [" + type + "] " + message;
				exports.udp.log(text);
			}
		}
};
		
