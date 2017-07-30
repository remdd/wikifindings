var express = require('express');
var router 	= express.Router();
var Finding = require('../models/finding');
var Comment = require('../models/comment');

//	CREATE comment form
router.get('/findings/:id/comments/new', isLoggedIn, function(req, res) {
	Finding.findById(req.params.id, function(err, finding) {
		if(err) {
			console.log(err);
		} else {
			res.render("comments/new", {finding: finding});
		}
	});
});

//	POST comment form
router.post('/findings/:id/comments', isLoggedIn, function(req, res) {
	Finding.findById(req.params.id, function(err, finding) {
		if(err) {
			console.log(err);
			res.redirect('/findings/' + finding._id);
		} else {
			Comment.create(req.body.comment, function(err, comment) {
				if(err) {
					console.log(err);
				} else {
					comment.author.id = req.user._id;
					comment.author.username = req.user.username;
					comment.save();
					comment.datePosted = Date.now();
					finding.comments.push(comment);
					finding.save();
					res.redirect('/findings/' + finding._id);
				}
			})
		}
	});
});

//	EDIT comment route
router.get('/findings/:id/comments/:comment_id/edit', function(req, res) {
	Comment.findById(req.params.comment_id, function(err, foundComment) {
		if(err) {
			res.redirect("back");
		} else {
			res.render("comments/edit", { finding_id: req.params.id, comment: foundComment });
		}
	})
});

//	UPDATE comment route
router.put('/findings/:id/comments/:comment_id/', function(req, res) {
	Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, function(err, updatedComment) {
		if(err) {
			res.redirect("back");
		} else {
			res.redirect("/findings/" + req.params.id);
		}
	});
});


//	Middleware function definition
function isLoggedIn(req, res, next) {
	if(req.isAuthenticated()) {
		return next();
	}
	res.redirect('/login');
}

module.exports = router;