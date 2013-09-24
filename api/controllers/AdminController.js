/**
 * AdminController
 *
 * @module		:: Controller
 * @description	:: Contains logic for handling requests.
 */
var defaultParams = {
	timeframe: "30m",
	application: 1,
	format: 'html',
	groupBy: 'message,file,line',
	text : '',
	orderBy: 'until DESC'

}

var timeframes = {
	'30m' : {
		code: '30m',
		description: 'Last 30 minutes',
		back : 60 * 30 * 1000,
		groupTime: 60,
		groupTimeDescripticion: "1 minute",
		groupTimeFormat: '%H:%i',
		groupTimeFormatCluster: '%H:%i'
	},

	'1h' : {
		code: '1h',
		description: 'Last 1 hour',
		back : 60 * 60 * 1000,
		groupTime: 60,
		groupTimeDescripticion: "1 minute",
		groupTimeFormat: '%H:%i',
		groupTimeFormatCluster: '%H:%i'
	},
	'3h' : {
		code: '3h',
		description: 'Last 3 hours',
		back : 60 * 60 * 1000 * 3,
		groupTime: 60,
		groupTimeDescripticion: "1 minute",
		groupTimeFormat: '%H:%i',
		groupTimeFormatCluster: '%H:%i'
	},
	'6h' : {
		code: '6h',
		description: 'Last 6 hours',
		back : 60 * 60 * 1000 * 6,
		groupTime: 60 * 60,
		groupTimeDescripticion: "1 hour",
		groupTimeFormat: '%H:00',
		groupTimeFormatCluster: '%H:%i'
	},
	'12h' : {
		code: '12h',
		description: 'Last 12 hours',
		back : 60 * 60 * 1000 * 12,
		groupTime: 60 * 60,
		groupTimeDescripticion: "1 hour",
		groupTimeFormat: '%H:00',
		groupTimeFormatCluster: '%H:%i'
	},
	'1d' : {
		code: '1d',
		description: 'Last 1 day',
		back : 60 * 60 * 1000 * 24,
		groupTime: 60 * 60,
		groupTimeDescripticion: "1 hour",
		groupTimeFormat: '%H:00',
		groupTimeFormatCluster: '%H:%i'
	},
	'3d' : {
		code: '3d',
		description: 'Last 3 days',
		back : 60 * 60 * 1000 * 24 * 3,
		groupTime: 60 * 60,
		groupTimeDescripticion: "1 hour",
		groupTimeFormat: '%d-%m-%y %H:00',
		groupTimeFormatCluster: '%H:%i'
	},
	'7d' : {
		code: '7d',
		description: 'Last 7 days',
		back : 60 * 60 * 1000 * 24 * 7,
		groupTime: 60 * 60,
		groupTimeDescripticion: "1 hour",
		groupTimeFormat: '%d-%m-%y %H:00',
		groupTimeFormatCluster: '%H:%i'
	}
}

var extend = require("extend");
var dateFormat = require("dateformat");
var errorToEnglish = require("errortoenglish");
var UAParser = require('ua-parser-js');
var parser = new UAParser();


module.exports = {
	show : function(req, res) {
		var params = extend({}, defaultParams, req.query);
		var view = {
			applications : process.data.applications,
			title : "Errors on " + process.data.applications[params.application].name,
			timeframes : timeframes,
			params : params
		}
		res.header("Content-Type", "text/html; charset=utf-8");
		res.view(view);
		// var params = defaultParams.extend(req.query);
		// this.title = "maxi";

		
	},

	getClusters : function(req, res) {
		var params = extend({}, defaultParams, req.query);
		var tf = timeframes[params.timeframe];
		var units = tf.back / 1000 / tf.groupTime;
		var now = new Date();
		//saca la hora sumandole el timeoffset * millisegundos y resta el time back correspondiente
		var limitBack = new Date(now.getTime() - tf.back);
		var limitBack=dateFormat(limitBack, "yyyy-mm-dd HH:MM:ss");
		
		var nowFormat=dateFormat(now.getTime(), "yyyy-mm-dd HH:MM:ss");


		var queryText = params.text ? " AND (a.message LIKE '%" + params.text + "%' OR a.name LIKE '%" + params.text + "%') " : '';
		var queryUrl = params.url ? " AND b.url LIKE '%" + params.url + "%' " : '';
		var queryUow = params.uow ? " AND b.uow LIKE '%" + params.uow + "%' " : '';

		console.log("Buscando errores despues de " + limitBack);
		console.log(params);
		console.log("SELECT a.*, b.*, GROUP_CONCAT(a.id) as ids, COUNT(*) as quantity, DATE_FORMAT(MIN(a.created), ?) as since, DATE_FORMAT(MAX(a.created), ?) as until, GROUP_CONCAT(DISTINCT browser) as browsers FROM problem a LEFT JOIN pageview b ON (a.pageview = b.id) WHERE application = ? AND a.created >= ? AND a.created <= ? " + queryUow + queryText + queryUrl + "GROUP BY "+params.groupBy+" ORDER BY ?");
		var q = Problem.query("SELECT a.*, b.*, GROUP_CONCAT(a.id) as ids, COUNT(*) as quantity, DATE_FORMAT(MIN(a.created), ?) as since, DATE_FORMAT(MAX(a.created), ?) as until, GROUP_CONCAT(DISTINCT browser) as browsers FROM problem a LEFT JOIN pageview b ON (a.pageview = b.id) WHERE application = ? AND a.created >= ? AND a.created <= ? " + queryUow + queryText + queryUrl + "GROUP BY "+params.groupBy+" ORDER BY ?", 
						[tf.groupTimeFormatCluster, tf.groupTimeFormatCluster, params.application, limitBack, nowFormat, params.orberBy], 
						function(err, results) {
							if (err) { console.log(err); res.send(500); }
							if (params.format == 'json') res.json(results);
							else res.view({layout: null, params : params, results: results});
						});
	},


	getGraph: function(req, res) {
		var params = extend({}, defaultParams, req.query);
		var tf = timeframes[params.timeframe];
		var units = tf.back / 1000 / tf.groupTime;
		var now = new Date().getTime();
		//saca la hora sumandole el timeoffset * millisegundos y resta el time back correspondiente
		var limitBack = new Date(now - tf.back);
		var limitBack=dateFormat(limitBack, "yyyy-mm-dd HH:MM:ss");
		
		var nowFormat=dateFormat(now, "yyyy-mm-dd HH:MM:ss");

		var queryText = params.text ? " AND (a.message LIKE '%" + params.text + "%' OR a.name LIKE '%" + params.text + "%') " : '';
		var queryUrl = params.url ? " AND b.url LIKE '%" + params.url + "%' " : '';
		var queryUow = params.uow ? " AND b.uow LIKE '%" + params.uow + "%' " : '';

		var labels = [];
		var labelsCount = (units < 12) ? units : 12;
		for (var i = 0; i < labelsCount; i++) {
				var dateLabel = new Date((now - tf.back) + tf.back / labelsCount * i);
			labels.push( {
				date: dateFormat(dateLabel, "HH:MM"),
				index: Math.floor(units / labelsCount * i)
			});
		}
		console.log(labels);


		console.log("Buscando errores despues de " + limitBack);
		Problem.query("SELECT COUNT(*) as quantity, DATE_FORMAT(a.created, ?) as stamp, DATE_FORMAT(DATE_ADD(a.created, INTERVAL " + tf.groupTimeDescripticion + "), ?) as stampTo, FLOOR(TIME_TO_SEC(TIMEDIFF(a.created, ?)) / "+tf.groupTime+") as position  FROM problem a LEFT JOIN pageview b ON (a.pageview = b.id) WHERE application = ? AND a.created >= ? AND a.created <= ? " + queryUow + queryText + queryUrl + "GROUP BY stamp, position ORDER BY stamp ASC", 
			[tf.groupTimeFormat, tf.groupTimeFormat,  limitBack, params.application, limitBack, nowFormat], 
			function(err, results) {
				if (err) { console.log(err); res.send(500); }
				var data = {};
				for (var i in results) {
					if (data[results[i].position]) results[i].position++;
					data[results[i].position] = results[i];
				}
				res.json({init: limitBack, end: nowFormat, units: units, data: data, labels: labels});
			});
	},

	getError : function(req, res) {
		if (req.query.id) {
			Problem.query("SELECT a.*, b.* FROM problem a LEFT JOIN pageview b ON (a.pageview = b.id) WHERE a.id = "+req.query.id, function(err, results) {
				if (err) { 
					console.log(err);
					res.json({});
				}
				console.log(results[0].created);
				results[0].created = dateFormat(results[0].created, "yyyy-mm-dd HH:MM:ss");
				results[0].timestamp /= 1000;
				results[0].timestamp += " seconds after page load.";
				res.json(results);
			});
		}
		else res.json({});
	},

	parseUA : function(req, res) {
		if (req.query.id) {
			Problem.query("SELECT b.user_agent FROM problem a LEFT JOIN pageview b ON (a.pageview = b.id) WHERE a.id = "+req.query.id, function(err, results) {
				if (err) {
					console.log(err);
					res.json({});
				}
				else res.json(parser.setUA(results[0].user_agent).getResult());
			});
		}
		else res.json({});
	}



};
