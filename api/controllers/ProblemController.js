/**
 * ProblemController
 *
 * @module		:: Controller
 * @description	:: Se encarga de guaradr los nuevos problemas
 */


var extend = require("extend");

module.exports = {

  create : function(req, res) {
	
	//Extiende los valores que vienen por post sobre los que vienen por get
	//de esta forma el controller es agnostico en cuanto a metodo http
	extend(req.query, req.body);
	//Luego crea el nuevo problema con los query
    Problem.create(req.query, function(err, result) {
		  res.json(result || err);
    });

  }

};



