var express = require('express');
var router 	= express.Router();
var passport = require('passport');
var User = require('../models/user');
var	async = require('async');
var	crypto = require('crypto');
var middleware 	= require('../middleware');
const email = require('../email')

var regEx = /(?=.*\d)(?=.*[a-zA-Z]).{8,20}/;			// Password complexity regEx - at least 1 number & 1 letter

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
router.post('/register', function(req, res, next) {
	var newUser = new User(req.body.user);
	newUser.isScientist = req.body.isScientist;
	if(req.body.password === req.body.confirmPassword) {
		if(req.body.user.email === req.body.confirmEmail) {
			var pwTest = regEx.test(req.body.password);
			if(pwTest) {
				User.register(newUser, req.body.password, function(err, user) {
					if(err) {
						if(err.code === 11000) {
							req.flash("error", "User already exists in the database");
							return res.redirect('/register');
						} else {
							req.flash("error", "Error: " + err.message);
							console.log(err);							// Need to test validations & handle different user errors here
							return res.redirect('/register');
						}
					} else {
						const authURL =
							`http://${req.headers.host}/verify/${user.authToken}`
						try {
							email.send('userReg', user.email, { authUrl: authURL })

							if(newUser.isScientist) {
								console.log("Emailing WikiFindings admin");
								email.send('scientistReg', process.env.ADMIN_EMAILS, { username: user.username })
							}
							req.flash("success", "Welcome! To complete your registration, please click the link in the email you have just been sent.");
							return res.redirect('/findings');
						} catch (err) {
							console.log(err)
							return res.redirect('/register');
						}
					}
				})
			} else {
				req.flash("error", "Error: Password does not meet complexity requirements");
				return res.redirect('/register');
			}
		} else {
			req.flash("error", "Error: Emails do not match");
			return res.redirect('/register');
		}
	} else {
		req.flash("error", "Error: Passwords do not match");
		return res.redirect('/register');
	}
});

router.get('/verify/:token', function(req, res) {
	User.verifyEmail(req.params.token, function(err, existingAuthToken) {
		if(err) {
			console.log('err:', err);
			req.flash('error', err);
		} else {
			console.log("Success!");
			return res.render('users/verify');
		}
	});
});



//	Render login form
router.get('/login', function(req, res) {
	res.render('users/login');
});

//	Login route
// router.post('/login', passport.authenticate('local', {
// 		successRedirect: '/findings',
// 		failureRedirect: '/login',
// 		failureFlash: true,
// 		successFlash: 'Welcome!'
// 	})
// );

//	Login route
router.post('/login', function(req, res, next) {
	passport.authenticate('local', function(err, user, info) {
		if(err) {
			req.flash('error', err)
			return next(err);
		}
		if(!user) {
			console.log(info);
			req.flash('error', info.message);
			return res.redirect('/login');
		}
		req.logIn(user, function(err) {
			if(err) {
				req.flash('error', err)
				return next(err);
			}
			User.findByIdAndUpdate(user._id,  { $inc: { loginCount: 1 }, lastLoginDate: Date.now() }, function(err) {
				if(err) {
					console.log(err);
				}
				req.flash('success', 'Welcome!');
				return res.redirect('/findings');
			});
		});
	}) (req, res, next);
});


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
					return res.redirect('back');
				}
				user.resetPasswordToken = token;
				user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
				user.save(function(err) {
					done(err, token, user);
				});
			});
		},
		function(token, user, done) {
			try {
				const link = 'http://' + req.headers.host + '/reset/' + token
				email.send('pwResetRequest', user.email, { link: link })
				req.flash("success", "An email with a reset link has been sent to " + user.email + ".");
				return res.redirect('back');
			} catch (err) {
				done(err, 'done');
			}
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
router.post('/reset/:token', async (req, res) => {
	async.waterfall([
		function(done) {
			User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
				if (!user) {
					req.flash("error", "Error: your reset token is invalid or has expired.");
					return res.redirect('back');
				}
				if(req.body.password === req.body.confirmPassword) {
					var pwTest = regEx.test(req.body.password);
					if(pwTest) {
						user.setPassword(req.body.password, function(err) {
							user.resetPasswordToken = undefined;
							user.resetPasswordExpires = undefined;
							user.save(function() {
								req.logIn(user, (err) => {
									if (err) {
										req.flash("error", err);
										return res.redirect('back');
									} else {
										email.send('pwChangeConfirmation', user.email, { user_email: user.email })
										req.flash("success", "You have successfully reset your password.");
										return res.redirect('/findings');
									}
								});
							});
						});
					} else {
						req.flash("error", "Error: Password does not meet complexity requirements");
						return res.redirect('back');
					}
				} else {
					req.flash("error", "Error: Passwords do not match");
					return res.redirect('back');
				}
			});
		},
	], function(err) {
		req.flash("Error: " + err.message)
		console.log(err);
		res.redirect('/findings');
	});
});


module.exports = router;
