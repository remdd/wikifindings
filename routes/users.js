var express = require('express');
var router 	= express.Router();
var passport = require('passport');
var User = require('../models/user');
var Finding = require('../models/finding');
var	async = require('async');
var	crypto = require('crypto');
var nodemailer = require('nodemailer');
var middleware 	= require('../middleware');

//	User profile route
router.get('/:username', function(req, res) {
	User.findOne( { username: req.params.username }, function(err, foundUser) {
		if(err) {
			console.log(err);
		} else if(!foundUser) {
			res.render('404');
		} else {
			Finding.find({'postAuthor': foundUser})
			.populate('subject subjectGroup category postAuthor')
			.sort({ datePosted: -1 })
			.exec(function(err, filteredFindings) {
				if(err) {
					console.log(err);
					req.flash("error", "Something went wrong...");
					res.redirect('back');
				} else {
					if(req.user && req.user.username == foundUser.username) {
						res.render('users/privateProfile', { user: foundUser, findings: filteredFindings, admin: false });
					} else if(req.user && req.user.isAdministrator) {
						res.render('users/privateProfile', { user: foundUser, findings: filteredFindings, admin: true });
					} else {
						var publicUser = {
							_id: foundUser._id,
							username: foundUser.username,
							publicBio: foundUser.publicBio,
							isScientist: foundUser.isScientist,
							isVerifiedScientist: foundUser.isVerifiedScientist
						};
						res.render('users/publicProfile', { user: publicUser, findings: filteredFindings, admin: false });
					}
				}
			});
		}
	});
});

router.put('/:username', function(req, res) {
	if(req.user && (req.user._id.toString() === req.body.user._id) || req.user.isAdministrator) {
		User.findByIdAndUpdate(req.body.user._id, req.body.user, function(err, foundUser) {
			if(err) {
				console.log("failure");
			req.flash('error', 'Something went wrong...');
 			res.redirect('back');
			} else {
				console.log("success");
			req.flash('success', 'Changes have been saved.');
 			res.redirect('back');
			}
		});
	} else {
		req.flash('error', 'You need to be logged in to do that.');
		res.redirect('back');
	}
});



module.exports = router;
