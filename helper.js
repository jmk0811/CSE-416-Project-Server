module.exports.wrapAsync = function(fn) {
    return function (req, res, next) {
        fn(req, res, next).catch(e => next(e))
    }
}

module.exports.requireLogin = (req, res, next) => {
	if (req.session.userId == null) {
		return res.status(401).send("Need to login");
	}
	next();
};