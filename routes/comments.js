var express = require('express');
var router 	= express.Router();
var Finding = require('../models/finding');
var Comment = require('../models/comment');

//	CREATE comment on finding
router.get('/findings/:id/comments/new', isLoggedIn, function(req, res) {
	Finding.findById(req.params.id, function(err, finding) {
		if(err) {
			console.log(err);
		} else {
			res.render("comments/new", {finding: finding});
		}
	});
});

router.post('/findings/:id/comments', isLoggedIn, function(req, res) {
	Finding.findById(req.params.id, function(err, finding) {
		if(err) {
			console.log(err);
			res.redirect('/findings/' + finding._id);
		} else {
			req.body.comment.datePosted = Date.now();
			Comment.create(req.body.comment, function(err, comment) {
				if(err) {
					console.log(err);
				} else {
					console.log(comment.author);
					finding.comments.push(comment);
					finding.save();
					res.redirect('/findings/' + finding._id);
				}
			})
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