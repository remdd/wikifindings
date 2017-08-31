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
var	bodyParser 		= require('body-parser');


var resultsToShow = 10;


//	INDEX ALL FINDINGS route
router.get('/', function(req, res) {
	if(!(req.query.page)) {
		req.query.page = 1;
	}
	Finding.paginate( {}, { 
		limit: resultsToShow, 
		populate: 'subject subjectGroup category postAuthor',
		sort: {datePosted: -1}, 
		page: req.query.page 
	}, function(err, allFindings) {
		if(err) {
			req.flash("error", "Something went wrong...");
			console.log(err);
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
			populate: 'subject subjectGroup category postAuthor',
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
		populate: 'subject subjectGroup category postAuthor',
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
		populate: 'subject subjectGroup category postAuthor',
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
	req.body.finding.shortID = shortid.generate();		// need to add in validation to ensure that shortid is available
	req.body.finding.datePosted = Date.now();
	req.body.finding.postAuthor = req.user._id;
	if(req.body.finding.keywords) {
		req.body.finding.keywords_lower = req.body.finding.keywords.slice();
		keywordsToLower(req.body.finding.keywords_lower);
	}
	req.body.finding.citation.full = citationToString(req.body.finding);
	Finding.create(req.body.finding, function(err, finding) {
		if(err) {
			req.flash("error", "Something went wrong...");
			res.redirect('back');
		} else {
			if(req.body.finding.precededBy) {
				if(!(Array.isArray(req.body.finding.precededBy))) {
					req.body.finding.precededBy = [req.body.finding.precededBy];		// if precededBy is a single string, convert to single-value array
				}
				req.body.finding.precededBy.forEach(function(pid) {
					Finding.findByIdAndUpdate(pid, { $push: { "followedBy" : finding._id }}, function(err, precedingFinding) {
						if(err) {
							console.log(err);
						}
					});
				});
			}
			if(req.body.finding.followedBy) {
				if(!(Array.isArray(req.body.finding.followedBy))) {
					req.body.finding.followedBy = [req.body.finding.followedBy];		// if followedBy is a single string, convert to single-value array
				}
				req.body.finding.followedBy.forEach(function(pid) {
					Finding.findByIdAndUpdate(pid, { $push: { "precededBy" : finding._id }}, function(err, followingFinding) {
						if(err) {
							console.log(err);
						}
					});
				});
			}
			res.redirect('/findings/' + finding.id);
		}
	});
});

//	SHOW info about a finding
router.get('/:id', function(req, res) {
	Finding.findById(req.params.id)
	.populate({path: "comments", options: { sort: { 'datePosted': - 1 }}})
	.populate({path: "precededBy", options: { sort: { 'datePosted': - 1 }, populate: {path: "subject postAuthor"}}})
	.populate({path: "followedBy", options: { sort: { 'datePosted': - 1 }, populate: {path: "subject postAuthor"}}})
	.populate({path: "subject"})
	.populate({path: "postAuthor"})
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
							Finding.findById(req.params.id)
							.populate({path: "precededBy"})
							.populate({path: "followedBy"})
							.exec(function(err, shownFinding) {
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
	//	Maintain sync of preceded by / followed by records
	var originalPrecededBy = [];
	var originalFollowedBy = [];
	//	Ensure req.body.finding.followedBy & precededBy are Arrays
	if(!(req.body.finding.followedBy)) {
		req.body.finding.followedBy = [];
	} else if(!(Array.isArray(req.body.finding.followedBy))) {
		req.body.finding.followedBy = [req.body.finding.followedBy];
	}
	if(!(req.body.finding.precededBy)) {
		req.body.finding.precededBy = [];
	} else if(!(Array.isArray(req.body.finding.precededBy))) {
		req.body.finding.precededBy = [req.body.finding.precededBy];
	}
	Finding.findById(req.params.id, function(err, originalFinding) {
		if(err) {
			req.flash("error", "Something went wrong...");
			res.redirect('/findings');
		} else {
			originalFollowedBy = originalFinding.followedBy.slice();
			originalPrecededBy = originalFinding.precededBy.slice();
		}
		//	Removes all existing precededBy & followedBy references to Finding being updated
		originalPrecededBy.forEach(function(pid) {
			Finding.findByIdAndUpdate(pid, { $pull: { "followedBy" : req.params.id }}, function(err) {
				if(err) {
					console.log(err);
				}
			});
		});
		originalFollowedBy.forEach(function(pid) {
			Finding.findByIdAndUpdate(pid, { $pull: { "precededBy" : req.params.id }}, function(err) {
				if(err) {
					console.log(err);
				}
			});
		});
		//	Adds all precededBy & followedBy references from update request
		req.body.finding.precededBy.forEach(function(pid) {
			Finding.findByIdAndUpdate(pid, { $push: { "followedBy" : req.params.id }}, function(err) {
				if(err) {
					console.log(err);
				}
			});
		});
		req.body.finding.followedBy.forEach(function(pid) {
			Finding.findByIdAndUpdate(pid, { $push: { "precededBy" : req.params.id }}, function(err) {
				if(err) {
					console.log(err);
				}
			});
		});
	});
	req.body.finding.citation.full = citationToString(req.body.finding);
	Finding.findByIdAndUpdate(req.params.id, req.body.finding, function(err, updatedFinding) {
		if(err) {
			req.flash("error", "Something went wrong...");
			res.redirect('/findings');
		} else {
			res.redirect('/findings/' + updatedFinding._id);
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

//	Search for single Finding by shortID ( used by 'preceded by' / 'followed by' lookups)
router.get('/i/:sid', function(req, res) {
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

//	Utility functions
function citationToString(finding) {
	var fullString = "";
	if(!(Array.isArray(finding.citation.authors))) {
		fullString += finding.citation.authors;
		fullString += '. ';
	} else {
		for(var i = 0; i < finding.citation.authors.length; i++) {
			fullString += finding.citation.authors[i];
			if(i < finding.citation.authors.length - 1) {
				fullString += ', ';
			} else {
				fullString += '. '
			}
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
	return(fullString);
}

function keywordsToLower(arr) {
	for(var i = 0; i < arr.length; i ++) {
		arr[i] = arr[i].toLowerCase();
	}
}

module.exports = router;
