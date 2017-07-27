var express = require('express');
var router 	= express.Router();
var passport = require('passport');
var User = require('../models/user');

//	Home route
router.get('/', function(req, res) {
	res.render('home');
});

//	AUTHENTICATION ROUTES
router.get('/register', function(req, res) {
	res.render('users/register');
});

router.post('/register', function(req, res) {
	var newUser = new User({username: req.body.username});
	User.register(newUser, req.body.password, function(err, user) {
		if(err) {
			console.log(err);
			return res.render('users/register');
		}
		passport.authenticate('local')(req, res, function() {
			res.redirect('/findings');
		});
	});
});

router.get('/login', function(req, res) {
	res.render('users/login');
})

router.post('/login', passport.authenticate('local', {
	successRedirect: '/findings',
	failureRedirect: '/login'
}), function(req, res) {

});

router.get('/logout', function(req, res) {
	req.logout();			// all that passport requires to end session
	res.redirect('/');
});

// //	Fallback route
// router.get('*', function(req, res) {
// 	res.send('404 page not found...')
// });

//	Middleware function definition
function isLoggedIn(req, res, next) {
	if(req.isAuthenticated()) {
		return next();
	}
	res.redirect('/login');
}

module.exports = router;