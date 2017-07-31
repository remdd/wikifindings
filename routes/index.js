var express = require('express');
var router 	= express.Router();
var passport = require('passport');
var User = require('../models/user');
var	async = require('async');
var	crypto = require('crypto');
var nodemailer = require('nodemailer');
var middleware 	= require('../middleware');

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
	res.render('users/register');
});

//	Register new user route
router.post('/register', function(req, res) {
	var newUser = new User({username: req.body.username, email: req.body.email, isScientist: req.body.isScientist});
	if(req.body.password === req.body.confirm) {
		User.register(newUser, req.body.password, function(err, user) {
			if(err) {
				console.log(err);
				return res.render('users/register');
			}
			passport.authenticate('local')(req, res, function() {
				res.redirect('/findings');
			});
		});
	} else {
		console.log("Passwords do not match...");
		res.render('users/register');
	}
});

//	Render login form
router.get('/login', function(req, res) {
	res.render('users/login');
})

//	Login route
router.post('/login', passport.authenticate('local', {
	successRedirect: '/findings',
	failureRedirect: '/login'
}), function(req, res) {

});

//	Logout route
router.get('/logout', function(req, res) {
	req.logout();			// all that passport requires to end session
	res.redirect('/');
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
					console.log(req.body.email + " ...not found!");			/// Need to handle properly!
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
				from: 'passwordreset@demo.com',
				subject: 'Node.js Password Reset',
				text: 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
				'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
				'http://' + req.headers.host + '/reset/' + token + '\n\n' +
				'If you did not request this, please ignore this email and your password will remain unchanged.\n'
			};
			smtpTransport.sendMail(mailOptions, function(err) {
				console.log('An e-mail has been sent to ' + user.email + ' with further instructions.');
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
			console.log('error', 'Password reset token is invalid or has expired.');				//	Handle properly
			return res.redirect('/forgot');
		}
		res.render('users/reset', {
			token: req.params.token
		});
	});
});

//	Token password reset route
router.post('/reset/:token', function(req, res) {
	console.log("Posting new pw...");
	async.waterfall([
		function(done) {
			User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
				if (!user) {
					console.log('Password reset token is invalid or has expired.');
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
					console.log("Passwords don't match!");
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
				from: 'passwordreset@demo.com',
				subject: 'Your password has been changed',
				text: 'Hello,\n\n' +
				'This is a confirmation that the password for your account ' + user.email + ' has just been changed.\n'
			};
			smtpTransport.sendMail(mailOptions, function(err) {
				console.log('Success! Your password has been changed.');
				done(err);
			});
		}
	], function(err) {
		console.log(err);
		res.redirect('/about');
	});
});



//	ADMIN routes ********************
//	DEV todo list //
router.get('/todo', middleware.isLoggedIn, middleware.isScientist, function(req, res) {
	res.render('admin/todo');
});

//	Category styling //
router.get('/styles', middleware.isLoggedIn, middleware.isScientist, function(req, res) {
	res.render('admin/categoryStyling');
});



module.exports = router;