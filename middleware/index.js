//	All the middleware
var middlewareObj = {

	isLoggedIn: function(req, res, next) {
		if(req.isAuthenticated()) {
			return next();
		}
		res.redirect('/login');
	},

	isScientist: function(req, res, next) {
		if(req.user.isScientist === true) {
			return next();
		}
		res.redirect('/');
	},

	isUsersFinding:	function (req, res, next) {
		if(req.isAuthenticated()){
			Finding.findById(req.params.id, function(err, shownFinding) {
				if(err) {
					res.redirect('back');
				} else {
					if(!shownFinding.postAuthor.id) {
						console.log("Seed finding, has no postAuthor.id...");
						next();
					} else if(shownFinding.postAuthor.id.equals(req.user._id)) {	// need to use .equals method as xxx.id is a mongoose model, req.user.id is a string - not equiv!
						next();
					} else {
						console.log("Not your finding!");
						res.redirect("back");
					}
				}
			});
		} else {
			res.redirect("back");
		}
	},

	isUsersComment: function() {
		//	Middleware goes here!!
	}

}

module.exports = middlewareObj;