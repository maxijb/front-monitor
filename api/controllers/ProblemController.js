/**
 * ProblemController
 *
 * @module		:: Controller
 * @description	:: Contains logic for handling requests.
 */


var extend = require("extend");

module.exports = {

  /* e.g.
  sayHello: function (req, res) {
    res.send('hello world!');
  }
  */
  create : function(req, res) {
//	  var pageview = extend({table : "pageview" + req.query.application}, Pageview.getDefaultObject(), req.query); 
//	  connection.query("SELECT * FROM " + pageview.table + " WHERE application = :application", pageview, function(err, res) {
//		  console.log(err);
//	  });
////	  console.log(Problem);
//	  res.json(Problem.attributes);
//	  
//	  
////	  console.log(result.insertId);
//  }
	  
	    Problem.create(req.query, function(err, result) {
	    
		  res.json(result || err);
	    });
	  }

};



