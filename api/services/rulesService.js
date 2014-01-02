

/**
* Job para recrear las reglas en cache
**/
exports.cacheByApplication = function(id, callback, next) {

	var rulesId = {};
	//reset all rules required
	if (id) {
		process.data.applications[id].rules = [];
		rulesId.application_id = id;
	} 
	else {
		for (var i in process.data.applications)
		 	process.data.applications[i].rules = [];
	}

	Rules.find(rulesId, function(err, results) {
       for (var i in results) {
       	  if (results[i].application_id)
          	process.data.applications[results[i].application_id].rules.push(results[i]);
       }
       callback(next);
  	});
}



/**
* Valida las reglas para aplicacion
**/
exports.validate = function(problem) {
	var rules = process.data.applications[problem.application].rules;
	if (rules && rules.length) {
		for (var i = 0; i < rules.length; i++) {
			var rule = rules[i];
			if (operations[rule.condition](problem[rule.field], rule.value)) {
				return false;
			}
		}
	}
	return true;

}



/**
 * Operaciones que pueden tener las reglas
 */
var operations = {
		equals : function(a, b) {
			return a == b;
		},
		notEquals : function(a, b) {
			return a != b;
		},
		contains : function(a, b) {
			return !!a && a.indexOf ? a.indexOf(b) != -1 : false;
		},
		notContains : function(a, b) {
			return !!a && a.indexOf ? a.indexOf(b) == -1 : false;
		}
};

