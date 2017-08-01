var express 	= require('express');
var router 		= express.Router();
var Finding 	= require('../models/finding');
var Comment 	= require('../models/comment');
var middleware 	= require('../middleware');
var	mongoosePaginate = require('mongoose-paginate');

var resultsToShow = 10;

//	INDEX ALL FINDINGS route
router.get('/', function(req, res) {
	if(!(req.query.page)) {
		req.query.page = 1;
	}
	Finding.paginate( {}, { limit: resultsToShow, sort: {datePosted: -1}, page: req.query.page }, function(err, allFindings) {
		if(err) {
			console.log(err);
		} else {
 			res.render("findings/index", {findings: allFindings})
		}
	});
});

//	INDEX BY SUBJECT route
router.get('/s', function(req, res) {
	var subjectName = req.query.subject;
	if(!(req.query.page)) {
		req.query.page = 1;
	}
	Finding.paginate( {subject: subjectName}, { limit: resultsToShow, sort: {datePosted: -1}, page: req.query.page }, function(err, filteredFindings) {
		if(err) {
			console.log(err);
			res.redirect('/findings');
		} else {
			res.render('findings/subject', {findings: filteredFindings, subject: subjectName});
		}
	});
});

//	INDEX BY KEYWORD route
router.get('/k', function(req, res) {
	var keyword = req.query.keyword;
	if(!(req.query.page)) {
		req.query.page = 1;
	}
	Finding.paginate({keywords_lower: { $all: [keyword.toLowerCase()] } }, { limit: resultsToShow, sort: {datePosted: -1}, page: req.query.page }, function(err, filteredFindings) {
		if(err) {
			console.log(err);
			res.redirect('/findings');
		} else {
			res.render('findings/keyword', {findings: filteredFindings, keyword: keyword});
		}
	});
});

//	INDEX BY POSTEDBY route 			-- NEED TO CHANGE postAuthor.username to postAuthor.id for production! Below is a fudge for quick use of seed data
router.get('/p', function(req, res) {
	var postAuthor = req.query.postAuthor;
	if(!(req.query.page)) {
		req.query.page = 1;
	}
	Finding.paginate({'postAuthor.username': postAuthor}, { limit: resultsToShow, sort: {datePosted: -1}, page: req.query.page }, function(err, filteredFindings) {
		if(err) {
			console.log(err);
			res.redirect('/findings');
		} else {
			res.render('findings/postAuthor', {findings: filteredFindings, postAuthor: postAuthor});
		}
	});
});

//	NEW - show form to create new campground
router.get('/new', middleware.isLoggedIn, function(req, res) {
	res.render('findings/new');
});

//	CREATE new finding route
router.post('/', middleware.isLoggedIn, function(req, res) {
	req.body.finding.datePosted = Date.now();
	req.body.finding.postAuthor = {
		id: req.user._id,
		username: req.user.username
	}
	var keywords_lower = [];
	for(var i = 0; i < req.body.finding.keywords.length; i ++) {
		keywords_lower[i] = req.body.finding.keywords[i].toLowerCase();
	}
	req.body.finding.keywords_lower = keywords_lower;
	Finding.create(req.body.finding, function(err, finding) {
		if(err) {
			console.log(err);
		} else {
			res.redirect('/findings/' + finding.id);
		}
	});
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
router.get('/:id/edit', middleware.isUsersFinding, function(req, res) {
	Finding.findById(req.params.id, function(err, shownFinding) {
		if(err) {
			console.log(err);
		} else {
			res.render('findings/edit', {finding: shownFinding});
		}
	});
});

//	UPDATE a finding
router.put('/:id', middleware.isUsersFinding, function(req, res) {
	var keywords_lower = [];
	for(var i = 0; i < req.body.finding.keywords.length; i ++) {
		keywords_lower[i] = req.body.finding.keywords[i].toLowerCase();
	}
	req.body.finding.keywords_lower = keywords_lower;
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
router.delete('/:id', middleware.isUsersFinding, function(req, res) {
	Finding.findByIdAndRemove(req.params.id, function(err) {
		if(err) {
			console.log(err);
			res.redirect('/findings');
		} else {
			res.redirect('/findings');
		}
	})
});


module.exports = router;
