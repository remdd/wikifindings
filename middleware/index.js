//	Note that other objects need only to require('pathto/middleware'), not 'index.js', as index is automatically assumed from a dirname by express

var Finding 	= require('../models/finding');
var Comment 	= require('../models/comment');

var middlewareObj = {

	isLoggedIn: function(req, res, next) {
		if(req.isAuthenticated()) {
			return next();
		}
		req.flash("error", "You must be logged in to do that!");
		res.redirect('/login');
	},

	isScientist: function(req, res, next) {
		if(req.user.isScientist === true || req.user.isAdministrator === true) {
			return next();
		}
		req.flash("error", "You don't have permission to do that!");
		res.redirect("back");
	},

	isUsersFinding:	function (req, res, next) {
		if(req.isAuthenticated()){
			Finding.findById(req.params.id, function(err, shownFinding) {
				if(err) {
					req.flash("error", "Something went wrong...");
					res.redirect('back');
				} else {
					if (req.user.isAdministrator === true) {
						req.flash("success", "Administrator permission granted");
						next();
					} else if(!shownFinding.postAuthor.id) {
						req.flash("error", "You don't have permission to do that!");
						res.redirect("back");
					} else if(shownFinding.postAuthor.id.equals(req.user._id)) {	// need to use .equals method as xxx.id is a mongoose model, req.user.id is a string - not equiv!
						next();
					} else {
						req.flash("error", "You don't have permission to do that!");
						res.redirect("back");
					}
				}
			});
		} else {
			req.flash("error", "You must be logged in to do that.");
			res.redirect("/login");
		}
	},

	isUsersComment: function(req, res, next) {
		if(req.isAuthenticated()){
			Comment.findById(req.params.comment_id, function(err, foundComment) {
				if(err) {
					req.flash("error", "Something went wrong...");
					res.redirect('back');
				} else {
					if(req.user.isAdministrator === true) {
						req.flash("success", "Administrator permission granted");
						next();
					} else if(!foundComment.author.id) {
						req.flash("Error", "Something went wrong...");
						res.redirect("back");
					} else if(foundComment.author.id.equals(req.user._id)) {
						next();
					} else {
						req.flash("error", "You don't have permission to do that!");
						res.redirect('back');
					}
				}
			});
		} else {
			req.flash("error", "You must be logged in to do that.");
			res.redirect("/login");
		}
	},

	isAdministrator: function(req, res, next) {
		if(req.isAuthenticated()) {
			if(req.user.isAdministrator === true) {
				return next();
			} else {
				req.flash("error", "You don't have permission to do that!");
				res.redirect("/findings");
			}
		} else {
			req.flash("error", "You must be logged in to do that.");
			res.redirect("/login");
		}
	}


}

module.exports = middlewareObj;