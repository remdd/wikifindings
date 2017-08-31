var express = require('express');
var router 	= express.Router();
var passport = require('passport');
var User = require('../models/user');
var	async = require('async');
var	crypto = require('crypto');
var nodemailer = require('nodemailer');
var middleware 	= require('../middleware');

var regEx = new RegExp('^(?=.*\d)(?=.*[a-zA-Z]).{8,}$');			// Password complexity regEx - at least 1 number & 1 letter

var adminEmailAddress = "admin@wikifindings.net";

//	Home route
router.get('/', function(req, res) {
	res.render('home');
});

//	About route
router.get('/about', function(req, res) {
	res.render('about');
});

//	AUTHENTICATION ROUTES
//	Render new user form
router.get('/register', function(req, res) {
	res.render('users/register', {regEx: regEx} );
});

//	Register new user route
router.post('/register', function(req, res) {
	var newUser = new User(req.body.user);
	console.log(req.body.isScientist);
	newUser.isScientist = req.body.isScientist;
	console.log(newUser);
	if(req.body.password === req.body.confirm) {
		if(regEx.test(req.body.password)) {
			User.register(newUser, req.body.password, function(err, user) {
				if(err) {
					if(err.code === 11000) {
						req.flash("error", "Error: Email address already exists in the database");
						res.redirect('/register');
					} else {
						req.flash("error", "Error: " + err.message);
						console.log(err);							// Need to test validations & handle different user errors here
						res.redirect('/register');
					}
				} else {
					passport.authenticate('local')(req, res, function() {
						res.redirect('/findings');
					});
				}
			});
		} else {
			req.flash("error", "Error: Password does not meet complexity requirements");
			res.redirect('/register');
		}
	} else {
		req.flash("error", "Error: Passwords do not match");
		res.redirect('/register');
	}
});

//	Render login form
router.get('/login', function(req, res) {
	res.render('users/login');
});

//	Login route
router.post('/login', passport.authenticate('local', {
	successRedirect: '/findings',
	failureRedirect: '/login',
	failureFlash: true,
	successFlash: 'Welcome!'
}));

//	Logout route
router.get('/logout', function(req, res) {
	req.logout();			// all that passport requires to end session
	req.flash("success", "You have successfully logged out.");
	res.redirect('/findings');
});

//	NODEMAILER / SENDGRID PASSWORD RESET ROUTES
//	Forgot password route
router.get('/forgot', function(req, res) {
  res.render('users/forgot');
});

//	Forgot password email send route
router.post('/forgot', function(req, res, next) {
	async.waterfall([
		function(done) {
			crypto.randomBytes(20, function(err, buf) {
				var token = buf.toString('hex');				//	Token is sent to user's email address within reset link
				done(err, token);
			});
		},
		function(token, done) {
			User.findOne({ email: req.body.email }, function(err, user) {
				if (!user) {
					req.flash("error", "Error: No account exists with that email address.");
					return res.redirect('/forgot');
				}
				user.resetPasswordToken = token;
				user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
				user.save(function(err) {
					done(err, token, user);
				});
			});
		},
		function(token, user, done) {
			var smtpTransport = nodemailer.createTransport({
				service: 'SendGrid',
				auth: {
					user: process.env.SG_USER,
					pass: process.env.SG_PASS					//	Need to implement this properly!
				},
				tls: { rejectUnauthorized: false }
			});
			var mailOptions = {
				to: user.email,
				from: adminEmailAddress,
				subject: 'WikiFindings password reset',
				text: 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
				'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
				'http://' + req.headers.host + '/reset/' + token + '\n\n' +
				'If you did not request this, please ignore this email and your password will remain unchanged.\n'
			};
			smtpTransport.sendMail(mailOptions, function(err) {
				req.flash("success", "An email with a reset link has been sent to " + user.email + ".");
				done(err, 'done');
			});
		}
	], function(err) {
		if (err) return next(err);
		res.redirect('/forgot');
	});
});

//	Token password reset form
router.get('/reset/:token', function(req, res) {
	User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
		if (!user) {
			req.flash("error", "Error: your reset token is invalid or has expired.");
			return res.redirect('/forgot');
		}
		res.render('users/reset', {
			token: req.params.token
		});
	});
});

//	Token password reset route
router.post('/reset/:token', function(req, res) {
	async.waterfall([
		function(done) {
			User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
				if (!user) {
					req.flash("error", "Error: your reset token is invalid or has expired.");
					return res.redirect('back');
				}
				if(req.body.password === req.body.confirm) {
					user.setPassword(req.body.password, function(err) {
						user.resetPasswordToken = undefined;
						user.resetPasswordExpires = undefined;

						user.save(function(err) {
							req.logIn(user, function(err) {
								done(err, user);
							});
						});
					});
				} else {
					req.flash("error", "Error: Passwords do not match");
					return res.redirect('back');
				}
			});
		},
		function(user, done) {
			var smtpTransport = nodemailer.createTransport({
				service: 'SendGrid',
				auth: {
					user: process.env.SG_USER,
					pass: process.env.SG_PASS					//	Need to implement this properly!
				},
				tls: { rejectUnauthorized: false }
			});
			var mailOptions = {
				to: user.email,
				from: adminEmailAddress,
				subject: 'Your WikiFindings password has been changed',
				text: 'Hello,\n\n' +
				'This is a confirmation that the password for your account ' + user.email + ' has just been changed.\n'
			};
			smtpTransport.sendMail(mailOptions, function(err) {
				req.flash("success", "You have successfully reset your password.");
				res.redirect('/findings');
				done(err);
			});
		}
	], function(err) {
		req.flash("Error: " + err.message)
		console.log(err);
		res.redirect('/findings');
	});
});


module.exports = router;
