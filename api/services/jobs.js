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
}