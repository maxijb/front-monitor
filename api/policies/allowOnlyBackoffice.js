/**
 * Allows only backoffice.despegar.com.ar if prod
 */
module.exports = function (req, res, ok) {

  // User is not allowed
  if (process.isProd && req.host != "backoffice.despegar.com" ) {
    return res.redirect("/notFound");
  }

  // User is allowed, proceed to controller
  else {
    return ok();
  }
};