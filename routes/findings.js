var express = require('express');
var router 	= express.Router();
var Finding = require('../models/finding');
var Comment = require('../models/comment');

//	INDEX route
router.get('/', function(req, res) {
	Finding.find({}, function(err, allFindings) {
		if(err) {
			console.log(err);
		} else {
			res.render("findings/index", {findings: allFindings})
		}
	}).sort({datePosted: -1});
});

//	INDEX BY SUBJECT route
router.get('/s', function(req, res) {
	var subjectName = req.query.subject;
	Finding.find({subject: subjectName}, function(err, filteredFindings) {
		if(err) {
			console.log(err);
			res.redirect('/findings');
		} else {
			res.render('findings/subject', {findings: filteredFindings, subject: subjectName});
		}
	}).sort({datePosted: -1});
	// res.render('findings', {findings: findingDB});
});

//	INDEX BY KEYWORD route
router.get('/k', function(req, res) {
	var keyword = req.query.keyword;
	Finding.find({keywords: { $all: [keyword] }}, function(err, filteredFindings) {
		if(err) {
			console.log(err);
			res.redirect('/findings');
		} else {
			res.render('findings/keyword', {findings: filteredFindings, keyword: keyword});
		}
	}).sort({datePosted: -1});
	// res.render('findings', {findings: findingDB});
});

//	INDEX BY POSTEDBY route
router.get('/p', function(req, res) {
	var postAuthor = req.query.postAuthor;
	Finding.find({postAuthor: postAuthor}, function(err, filteredFindings) {
		if(err) {
			console.log(err);
			res.redirect('/findings');
		} else {
			res.render('findings/postAuthor', {findings: filteredFindings, postAuthor: postAuthor});
		}
	}).sort({datePosted: -1});
	// res.render('findings', {findings: findingDB});
});

//	NEW - show form to create new campground
router.get('/new', isLoggedIn, function(req, res) {
	res.render('findings/new');
});

//	CREATE new finding route
router.post('/', isLoggedIn, function(req, res) {
	req.body.finding.datePosted = Date.now();
	Finding.create(req.body.finding, function(err) {
		if(err) {
			console.log(err);
		} else {
			res.redirect('/findings');
		}
	})
});

//	SHOW info about a finding
router.get('/:id', function(req, res) {
	Finding.findById(req.params.id).populate("comments").exec(function(err, shownFinding) {
		if(err) {
			console.log(err);
			res.redirect('/findings');
		} else {
			res.render('findings/show', {finding: shownFinding});
		}
	});
});

//	EDIT a finding
router.get('/:id/edit', function(req, res) {
	Finding.findById(req.params.id, function(err, shownFinding) {
		if(err) {
			console.log(err);
			res.redirect('/findings');
		} else {
			res.render('findings/edit', {finding: shownFinding});
		}
	});
});

//	UPDATE a finding
router.put('/:id', function(req, res) {
	Finding.findByIdAndUpdate(req.params.id, req.body.finding, function(err, updatedFinding) {
		if(err) {
			console.log(err);
			res.redirect('/findings');
		} else {
			res.redirect('/findings/' + req.params.id);
		}
	});
});

//	DELETE a finding
router.delete('/:id', function(req, res) {
	Finding.findByIdAndRemove(req.params.id, function(err) {
		if(err) {
			console.log(err);
			res.redirect('/findings');
		} else {
			res.redirect('/findings');
		}
	})
});




//	Middleware function definition
function isLoggedIn(req, res, next) {
	if(req.isAuthenticated()) {
		return next();
	}
	res.redirect('/login');
}

module.exports = router;
