var express = require('express');
var router 	= express.Router();
var passport = require('passport');
var User = require('../models/user');
var Finding = require('../models/finding');
var	async = require('async');
var	crypto = require('crypto');
var nodemailer = require('nodemailer');
var middleware 	= require('../middleware');
var	mongoosePaginate = require('mongoose-paginate');

//	User profile route
router.get('/', function(req, res) {
	var queryString = 'users/?username=' + req.query.username;
	User.findOne( { username: req.query.username }, function(err, foundUser) {
		if(err) {
			console.log(err);
		} else if(!foundUser) {
			res.render('404');
		} else {
			if(!(req.query.page)) {
				req.query.page = 1;
			}
			Finding.paginate( {'postAuthor': foundUser}, { 
				limit: 10,													//	Hardcoded for now 
				populate: 'subject subjectGroup category postAuthor',
				sort: { datePosted: -1 }, 
				page: req.query.page 
			}, function(err, filteredFindings) {
				if(err) {
					console.log(err);
					req.flash("error", "Something went wrong...");
					res.redirect('/findings');
				} else {
					if(req.user && req.user.username == foundUser.username) {
						res.render('users/privateProfile', { user: foundUser, findings: filteredFindings, admin: false, queryString: queryString });
					} else if(req.user && req.user.isAdministrator) {
						res.render('users/privateProfile', { user: foundUser, findings: filteredFindings, admin: true, queryString: queryString });
					} else {
						var publicUser = {
							_id: foundUser._id,
							username: foundUser.username,
							publicBio: foundUser.publicBio,
							isScientist: foundUser.isScientist,
							isVerifiedScientist: foundUser.isVerifiedScientist
						};
						res.render('users/publicProfile', { user: publicUser, findings: filteredFindings, admin: false, queryString: queryString });
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
