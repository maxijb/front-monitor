/**
 * Problem
 *
 * @module      :: Model
 * @description :: A short summary of how this model works and what it represents.
 *
 */
var UAParser = require('ua-parser-js');
var parser = new UAParser();
var errorToEnglish = require("errortoenglish-despegar");
var dateFormat = require("dateformat");
var extend = require("extend");

var mysql  = require('mysql');

var connection = mysql.createConnection({
	host    : 'mysql-test',
    port : 64220,
    user    : 'front_app',
    password  : 'tn0f4859',
    database  : 'front_monitor'
});

connection.config.queryFormat = function (query, values) {
	  if (!values) return query;
	  var finalQuery = query.replace(/\:(\w+)/g, function (txt, key) {
	    if (values.hasOwnProperty(key)) {
	      return this.escape(values[key]);
	    }
	    return txt;
	  }.bind(this));
	  loggers.udp.debug(finalQuery);
	  return finalQuery;
	};
	


module.exports = {
	
	autoCreatedAt: false,
  	autoUpdatedAt: false,

  attributes: {
  	
  	id: 'INTEGER',
  	name: 'STRING',
  	message: 'STRING',
  	file: 'STRING',
  	line: 'INTEGER',   
  	char: 'INTEGER',
  	stack: 'STRING',
  	event_type: 'STRING',
  	event_target: 'STRING',   
  	event_selector: 'STRING',
  	timestamp: 'INTEGER',
  	pageview : 'INTEGER',
  	created : 'timestamp'
  	
  },

  beforeCreate: function(values, next) {
    values.url = values.baseUrl;
  	values.created = values.createdAt = dateFormat(new Date().getTime(), "yyyy-mm-dd HH:MM:ss");
  	
    if (values.stack && !values.file) {
  		matches = values.stack.match(/(http:.*?):(\d*?):?(\d*?)?(\s|\))/);
  		loggers.udp.debug(matches);
  		if (matches && matches.length > 3) {
  			values.file = matches[1];
        //chorme or || firefox
  			values.line = matches[2] || matches[3];
        //chrome
        if (matches[2]) values.char = matches[3];
  		}
  	}

  	var ua = parser.setUA(values.user_agent).getResult();

  	if (!values.pageview) {
		values.browser = ua.browser.name;
		values.major_version = ua.browser.major;
		values.os = ua.os.name;
  	}

  	completeCreate(ua, values, next);
  }
  ,
  /**
   * Ovverride create method
   * @param params
   * @param cb
   */
  create : function(params, cb) {
	  if (!params.application) {
		  loggers.udp.warning("Null application on create problem");
		  return cb({"error" : "Null aplication"}, null);
	  }
	  
	  module.exports.beforeCreate(params, function(data) {
			if (!data.pageview) {
				
		  	  var pageview = extend({table : "pageview" + data.application}, Pageview.getDefaultObject(), data); 
			  connection.query("INSERT INTO " + pageview.table + " SET url = :url, uow = :uow, custom_parameter = :custom_parameter, user_agent = :user_agent, browser = :browser, major_version = :major_version, cookies = :cookies, os = :os, createdAt = :createdAt", pageview, function(err, res) {
				  if (err) {
					  loggers.udp.error(err);
					  cb(err, null); 
				  }
				  else {
					  data.pageview = res.insertId;
					  saveProblem(data, cb);
				  }
			  });
			} else {
					saveProblem(data, cb);
			}
	  });
  }
  
 /**
  * Devuelve un objeto vacio dle modelo
  */
  ,getDefaultObject: function() { return defaultObject}
	  


};

/**
 * Guarda el prblema y llama al cb
 * @param data
 * @param cb
 */
function saveProblem(data, cb) {
	var problem = extend({table : "problem" + data.application}, defaultObject, data);
	  connection.query("INSERT INTO " + problem.table + " SET name = :name, message = :message, file = :file, line = :line, `char` = :char, stack = :stack, event_type = :event_type, event_target = :event_target, event_selector = :event_selector, timestamp = :timestamp, pageview = :pageview, created = :created", problem, function(error, resp) {
		  if (error) {
			  cb(error, null); 
		  }
		  else 
			  cb(null, {pageview : problem.pageview, id: resp.insertId});
	  }); 
}


//create default objects to be extended later
var defaultObject = createDefaultObject();
function createDefaultObject() {
	var obj = {};
	  for (var i in module.exports.attributes) {
		  if (i != 'id') {
			  obj[i] = (module.exports.attributes[i].type == "integer") ? 0 : '';
		  }
	  }
	  return obj;
}





function completeCreate(ua, values, next) {
	if (ua.browser.name == "IE") {
		// console.log(values);
  		errorToEnglish(values.message, function(err, translation){
  			// console.log(translation);
  			// console.log(err);
  			if (translation) values.message = translation;
			 next(values);
			});
  	}
  	else {
  		next(values);
  	}
}
