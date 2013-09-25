/**
 * AuthController
 *
 * @module		:: Controller
 * @description	:: Contains logic for handling requests.
 */

module.exports = {

  login: function (req, res) {
    res.view();
  },

  tryAuth : function(req, res) {
  	User.find({nickname : req.query.nickname, password : req.query.password}, function(err, results) {
  		console.log(err);
  		console.log(results);
  		if (err) res.send("Error");
  		else {
  			if (results.length) {
  				req.session.authenticated = true;
  				req.session.nickname = results[0].nickname;
  				res.send('ok');
  			}
  			else res.send('No users with those credentials.')
  		}
  	})
  },

  endSession : function(req, res) {
  	req.session.authenticated = false;
  	req.session.nickname = "";
  	res.redirect('/login');
  }
  

};
