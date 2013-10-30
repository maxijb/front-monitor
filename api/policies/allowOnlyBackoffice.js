/**
 * Allows only backoffice.despegar.com.ar if prod
 */
module.exports = function (req, res, ok) {

  // User is allowed, proceed to controller
  if (process.isProd && req.host != "backoffice.despegar.com" ) {
    return res.redirect("/notFound");
  }

  // User is not allowed
  else {
    return ok();
  }
};