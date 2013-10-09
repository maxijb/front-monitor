/**
 * Bootstrap
 *
 * An asynchronous boostrap function that runs before your Sails app gets lifted.
 * This gives you an opportunity to set up your data model, run jobs, or perform some special logic.
 *
 * For more information on bootstrapping your app, check out:
 * http://sailsjs.org/#documentation
 */
// var helper = require('/services/heleper');



module.exports.bootstrap = function (cb) {

  //Genera snapshot de aplicaciones
  Application.find({}, function(err, results) {
  	if (err) console.log(err);
  	else {
  		process.data = {};
  		process.data.applications = {};
  		for (var i in results) {
  			process.data.applications[results[i].id] = results[i];
  		}
  		// console.log(process.data.applications);
  	}
  })

  //tira y genera el interval para borrar logs viejos una vez por dia
  jobs.deleteOldRecords();
  setInterval(jobs.deleteOldRecords, (60*60*24*1000));
  console.info("Job for removing old logs set!");

  // It's very important to trigger this callack method when you are finished 
  // with the bootstrap!  (otherwise your server will never lift, since it's waiting on the bootstrap)
  cb();
};