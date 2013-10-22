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
  	values.created =dateFormat(new Date().getTime(), "yyyy-mm-dd HH:MM:ss");
  	
    if (values.stack && !values.file) {
  		matches = values.stack.match(/(http:.*?):(\d*?):?(\d*?)?(\s|\))/);
  		console.log(matches);
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
    
      values.forceTableName = "pageview" + values.application;
      Pageview.create(values, function(err, page) {
        // console.log(err.ValidationError);
        // console.log(page);
        if (page) values.pageview = page.id;
        else console.log(err);
        
      values.forceTableName = "problem" + values.application;
  			completeCreate(ua, values, next);
	  	});
  	} else {
  		completeCreate(ua, values, next);
  	}


  	


  }

};


function completeCreate(ua, values, next) {
	if (ua.browser.name == "IE") {
		// console.log(values);
  		errorToEnglish(values.message, function(err, translation){
  			// console.log(translation);
  			// console.log(err);
  			if (translation) values.message = translation;
			 next();
			});
  	}
  	else {
  		next();
  	}
}
