module.exports = function getCommonParams (req, res, next) {
	
	// `req.session` contains a set of data specific to the user making this request.
	// It's kind of like our app's "memory" of the current user.
	
	// If our user has a history of animal cruelty, not only will we 
	// prevent her from going even one step further (`return`), 
	// we'll go ahead and redirect her to PETA (`res.redirect`).
	// if ( req.session.user.hasHistoryOfAnimalCruelty ) {
	// 	return res.redirect('http://PETA.org');
	// }

	// // If the user has been seen frowning at puppies, we have to assume that
	// // they might end up being mean to them, so we'll 
	// if ( req.session.user.frownsAtPuppies ) {
	// 	return res.redirect('http://www.dailypuppy.com/');
	// }
	// console.log(req);
	req.query.user_agent = req.get("user-agent");
	if (!req.query.cookies) {
		req.query.cookies = JSON.stringify(req.cookies);
	}
	// req.query.url = req.get("referer");
	
	// Finally, if the user has a clean record, we'll call the `next()` function
	// to let them through to the next policy or our controller
	next();
};