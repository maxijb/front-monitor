var dateFormat = require("dateformat");


/**
 * Job para borrar logueos de mas de una semana de antiguedad
 */
exports.deleteOldRecords = function(applications, callback) {
		var timeBack = new Date().getTime() - 60 * 60 * 24 * 7 * 1000;
		  var limitBack = new Date(timeBack);
		  var limitBack=dateFormat(limitBack, "yyyy-mm-dd HH:MM:ss");

		  console.log("Deleting old logs...");
		  var queriesToExecute = [];
		  for (var i in applications) {
					queriesToExecute.push("DELETE FROM pageview" + i + " WHERE createdAt < '" + limitBack + "'");
			}
		  executeQueries(queriesToExecute, "Deleting old",  callback);
	};
	

/**
 * Job para chequear que cada applicacion tenga su tabla por separado
 */
exports.checkForCreatedTables = function(applications, callback) {
		console.log("Checking for all aplication tables exist...");

		Problem.query("SHOW FULL TABLES", function(err, results) {
			var tables = {};
			console.log(results);
			for (var i in results) {
				tables[results[i].Tables_in_front_monitor] = true;
			}
			var queriesToExecute = [];
			for (var i in applications) {
				if (!tables["pageview" + i])
					queriesToExecute.push(baseQueries.pageview.replace(/\{APPLICATION_NUMBER\}/g, i));
				if (!tables["problem" + i])
					queriesToExecute.push(baseQueries.problem.replace(/\{APPLICATION_NUMBER\}/g, i));
			}

			

			executeQueries(queriesToExecute, "Creating tables",  callback);
		});
}


/**
 * Ejecuta una listade queries en forma secuencial, al tewrminar tira el callback
 * @param queries
 * @param message
 * @param callback
 */
function executeQueries(queries, message, callback) {
	if (queries.length) {
		console.log(message);
		console.log(queries[0]);
		Problem.query(queries[0], function(err, results) {
			queries.shift();
			executeQueries(queries, message, callback);
		});
	}
	else {
		console.log(message + " done...");
		if (typeof callback == "function") callback();
	}
}


var baseQueries = {

	pageview : "CREATE TABLE IF NOT EXISTS `pageview{APPLICATION_NUMBER}` ( \
	  `url` varchar(255) DEFAULT NULL, \
	  `uow` varchar(255) DEFAULT NULL, \
	  `custom_parameter` text NOT NULL, \
	  `user_agent` varchar(255) DEFAULT NULL, \
	  `browser` varchar(255) DEFAULT NULL, \
	  `major_version` varchar(255) DEFAULT NULL, \
	  `cookies` text NOT NULL, \
	  `os` varchar(255) DEFAULT NULL, \
	  `id` int(11) NOT NULL AUTO_INCREMENT, \
	  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP, \
	  PRIMARY KEY (`id`), \
	  KEY `url` (`url`), \
	  KEY `uow` (`uow`), \
	  KEY `browser` (`browser`), \
	  KEY `createdAt` (`createdAt`) \
	) ENGINE=InnoDB  DEFAULT CHARSET=utf8 ;",

	problem : " CREATE TABLE IF NOT EXISTS `problem{APPLICATION_NUMBER}` ( \
	  `id` bigint(11) unsigned NOT NULL AUTO_INCREMENT, \
	  `name` varchar(255) DEFAULT NULL, \
	  `message` varchar(255) DEFAULT NULL, \
	  `file` varchar(255) DEFAULT NULL, \
	  `line` int(11) DEFAULT NULL, \
	  `char` int(11) DEFAULT NULL, \
	  `stack` text, \
	  `event_type` varchar(255) DEFAULT NULL, \
	  `event_target` varchar(255) DEFAULT NULL, \
	  `event_selector` varchar(255) DEFAULT NULL, \
	  `timestamp` int(11) DEFAULT NULL, \
	  `pageview` int(11) DEFAULT NULL, \
	  `created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP, \
	  PRIMARY KEY (`id`), \
	  KEY `file` (`file`,`line`), \
	  KEY `file_2` (`file`,`line`,`message`), \
	  KEY `name` (`name`), \
	  KEY `message` (`message`), \
	  KEY `created` (`created`), \
	  FOREIGN KEY (`pageview`) REFERENCES `pageview{APPLICATION_NUMBER}` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION \
	) ENGINE=InnoDB  DEFAULT CHARSET=utf8;"

};