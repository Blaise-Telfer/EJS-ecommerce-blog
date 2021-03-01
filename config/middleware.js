var middlewareObj = {};

middlewareObj.isLoggedIn = function(req, res, next) {
	if(req.isAuthenticated()) {
		return next();
    }
    req.flash("error_message", "You need to be logged in to do that");
	res.redirect("/user/login");
}

middlewareObj.isAdmin = function(req, res, next) {
	if(req.isAuthenticated() && req.user.isAdmin) {
		return next();
    }
    req.flash("error_message", "Only admins have access here");
	res.redirect("/user/login");
}

module.exports = middlewareObj;
