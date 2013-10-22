var dateFormat = require("dateformat");

exports.deleteOldRecords = function() {
		var timeBack = new Date().getTime() - 60 * 60 * 24 * 7 * 1000;
		  var limitBack = new Date(timeBack);
		  var limitBack=dateFormat(limitBack, "yyyy-mm-dd HH:MM:ss");
		  var query = "DELETE FROM problem WHERE created < '" + limitBack + "'";
		  var query2 = "DELETE FROM pageview WHERE createdAt < '" + limitBack + "'";
		  console.log("Deleting old logs...");
		  Problem.query(query, function(err) {
		  	console.log(err || "50% complete...");
		  });
		  Problem.query(query2, function(err) {
		  	console.log(err || "Old logs removal done...");
		  });
	};

exports.checkForCreatedTables = function(applications, callback) {
		for (var i in applications) {
			console.log(i);
		}
		Problem.query("SHOW FULL TABLES", function(err, results) {
			var tables = {};
			for (var i in results) {
				tables[results[i].Tables_in_front_monitor] = true;
			}
			var queriesToExecute = [];
			for (var i in applications) {
				if (!tables["problem" + i])
					queriesToExecute.push(baseQueries.problem.replace(/\{APPLICATION_NUMBER\}/g, i));
				if (!tables["pageview" + i])
					queriesToExecute.push(baseQueries.pageview.replace(/\{APPLICATION_NUMBER\}/g, i));
			}

			console.log(queriesToExecute);

			executeQueries(queriesToExecute, callback);
		});
}


function executeQueries(queries, callback) {
	if (queries.length) {
		Problem.query(queries[0], function(err, results) {
			queries.shift();
			executeQueries(queries, callback)
		});
	}
	else callback();
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
	  `createdAt` datetime DEFAULT NULL, \
	  PRIMARY KEY (`id`), \
	  KEY `url` (`url`), \
	  KEY `uow` (`uow`), \
	  KEY `browser` (`browser`) \
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
	  KEY `pageview` (`pageview`), \
	  KEY `file` (`file`,`line`), \
	  KEY `file_2` (`file`,`line`,`message`), \
	  KEY `name` (`name`), \
	  KEY `message` (`message`) \
	) ENGINE=InnoDB  DEFAULT CHARSET=utf8;"

};