var express 		= require('express');
var router 			= express.Router();
var Finding 		= require('../models/finding');
var Comment 		= require('../models/comment');
var Subject 		= require('../models/subject');
var SubjectGroup 	= require('../models/subjectgroup');
var Category 		= require('../models/category');
var middleware 		= require('../middleware');
var	mongoosePaginate = require('mongoose-paginate');
var shortid 		= require('shortid32');

var resultsToShow = 10;


//	INDEX ALL FINDINGS route
router.get('/', function(req, res) {
	if(!(req.query.page)) {
		req.query.page = 1;
	}
	Finding.paginate( {}, { 
		limit: resultsToShow, 
		populate: 'subject subjectGroup category',
		sort: {datePosted: -1}, 
		page: req.query.page 
	}, function(err, allFindings) {
		if(err) {
			req.flash("error", "Something went wrong...");
			res.redirect('/findings');
		} else {
			res.render("findings/index", {findings: allFindings});
		}
	});
});


//	INDEX BY SUBJECT route
router.get('/s', function(req, res) {
	var subjectName = req.query.subject;
	Subject.findOne({"subjectName": subjectName}, function(err, subject) {
		if(!(req.query.page)) {
			req.query.page = 1;
		}
		Finding.paginate( {subject: subject._id}, { 
			limit: resultsToShow, 
			populate: 'subject subjectGroup category',
			sort: {datePosted: -1}, 
			page: req.query.page 
		}, function(err, filteredFindings) {
			if(err) {
				req.flash("error", "Something went wrong...");
				res.redirect('/findings');
			} else {
				res.render('findings/subject', {findings: filteredFindings, subject: subjectName});
			}
		});
	});
});

//	INDEX BY KEYWORD route
router.get('/k', function(req, res) {
	var keyword = req.query.keyword;
	if(!(req.query.page)) {
		req.query.page = 1;
	}
	Finding.paginate({keywords_lower: { $all: [keyword.toLowerCase()] } }, { 
		limit: resultsToShow, 
		populate: 'subject subjectGroup category',
		sort: {datePosted: -1}, 
		page: req.query.page 
	}, function(err, filteredFindings) {
		if(err) {
			req.flash("error", "Something went wrong...");
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
	Finding.paginate({'postAuthor.username': postAuthor}, { 
		limit: resultsToShow, 
		populate: 'subject subjectGroup category',
		sort: {datePosted: -1}, 
		page: req.query.page 
	}, function(err, filteredFindings) {
		if(err) {
			req.flash("error", "Something went wrong...");
			res.redirect('/findings');
		} else {
			res.render('findings/postAuthor', {findings: filteredFindings, postAuthor: postAuthor});
		}
	});
});

//	NEW - show form to create new finding
router.get('/new', middleware.isLoggedIn, function(req, res) {
	Category.find({}, function(err, categories) {
		if(err) {
			console.log(err);
			res.redirect('back');
		} else {
			SubjectGroup.find({}, function(err, subjectGroups) {
				if(err) {
					console.log(err);
					res.redirect('back');
				} else {
					Subject.find({}, function(err, subjects) {
						if(err) {
							console.log(err);
							res.redirect('back');
						} else {
							res.render('findings/new', {categories: categories, subjectGroups: subjectGroups, subjects: subjects});
						}
					})
				}
			}).populate({path: 'subjects', options: { sort: 'subjectName'}});
		}
	}).populate({path: 'subjectGroups', options: { sort: 'subjectGroupName'}, populate: {path: 'subjects', options: { sort: 'subjectName'}}}).sort({'categoryName': 'asc'});
});

//	CREATE new finding route
router.post('/', middleware.isLoggedIn, function(req, res) {
	req.body.finding.shortID = shortid.generate();		// need to add in validation to check that shortid is available
	req.body.finding.datePosted = Date.now();
	req.body.finding.postAuthor = {
		id: req.user._id,
		username: req.user.username
	}
	if(req.body.finding.keywords) {
		req.body.finding.keywords_lower = req.body.finding.keywords.slice();
		keywordsToLower(req.body.finding.keywords_lower);
	}
	Finding.create(req.body.finding, function(err, finding) {
		if(err) {
			req.flash("error", "Something went wrong...");
			console.log(err);
			res.redirect('/findings');
		} else {
			citationToString(finding);						//	need to use promises / async to wait for DB update before res.redirect
			res.redirect('/findings/' + finding.id);
		}
	});
});

function citationToString(finding) {
	var fullString = "";
	for(var i = 0; i < finding.citation.authors.length; i++) {
		fullString += finding.citation.authors[i];
		if(i < finding.citation.authors.length - 1) {
			fullString += ', ';
		} else {
			fullString += '. '
		}
	}
	fullString += finding.citation.title;
	fullString += '. ';
	fullString += finding.citation.journal;
	fullString += '. ';
	fullString += finding.citation.year;
	fullString += ';';
	fullString += finding.citation.location;
	fullString += '.';
	console.log(fullString);
	Finding.update({ _id: finding._id }, { $set: { 'citation.full': fullString }}, function(err) {
		if(err) {
			console.log(err);
		}
	});
}

function keywordsToLower(arr) {
	for(var i = 0; i < arr.length; i ++) {
		arr[i] = arr[i].toLowerCase();
	}
}

//	SHOW info about a finding
router.get('/:id', function(req, res) {
	Finding.findById(req.params.id)
	.populate({path: "comments", options: { sort: { 'datePosted': - 1 }}})
	.populate({path: "precededBy", options: { sort: { 'datePosted': - 1 }, populate: {path: "subject"}}})
	.populate({path: "followedBy", options: { sort: { 'datePosted': - 1 }, populate: {path: "subject"}}})
	.populate({path: "subject"})
	.exec(function(err, shownFinding) {
		if(err) {
			req.flash("error", "Something went wrong...");
			res.redirect('/findings');
		} else if(!shownFinding) {
			res.render('404');
		} else {
			res.render('findings/show', {finding: shownFinding});
		};
	});
});

//	EDIT a finding
router.get('/:id/edit', middleware.isUsersFinding, function(req, res) {
	Category.find({}, function(err, categories) {
		if(err) {
			console.log(err);
			res.redirect('back');
		} else {
			SubjectGroup.find({}, function(err, subjectGroups) {
				if(err) {
					console.log(err);
					res.redirect('back');
				} else {
					Subject.find({}, function(err, subjects) {
						if(err) {
							console.log(err);
							res.redirect('back');
						} else {
							Finding.findById(req.params.id, function(err, shownFinding) {
								if(err) {
									req.flash("error", "Something went wrong...");
									res.redirect('/findings');
								} else {
									res.render('findings/edit', {finding: shownFinding, categories: categories, subjectGroups: subjectGroups, subjects: subjects});
								}
							});
						}
					});
				}
			}).populate({path: 'subjects', options: { sort: 'subjectName'}});
		}
	}).populate({path: 'subjectGroups', options: { sort: 'subjectGroupName'}, populate: {path: 'subjects', options: { sort: 'subjectName'}}}).sort({'categoryName': 'asc'});
});

//	UPDATE a finding
router.put('/:id', middleware.isUsersFinding, function(req, res) {
	if(req.body.finding.keywords) {
		req.body.finding.keywords_lower = req.body.finding.keywords.slice();
		keywordsToLower(req.body.finding.keywords_lower);
	}
	Finding.findByIdAndUpdate(req.params.id, req.body.finding, function(err, updatedFinding) {
		if(err) {
			req.flash("error", "Something went wrong...");
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
			req.flash("error", "Something went wrong...");
			res.redirect('/findings');
		} else {
			res.redirect('/findings');
		}
	})
});

//	Search for single Finding by shortID ( preceded by / followed by)
router.get('/i/:sid', function(req, res) {
	console.log("route");
	Finding.findOne({"shortID": req.params.sid})
	.exec(function(err, shownFinding) {
		if(err) {
			req.flash("error", "Something went wrong...");
			res.redirect('/findings');
		} else {
			res.json(shownFinding);
		}
	});
});
 

module.exports = router;
