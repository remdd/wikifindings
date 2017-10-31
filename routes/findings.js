var express 		= require('express');
var router 			= express.Router();

var Finding 		= require('../models/finding');
var Finding_version = require('../models/finding_version');
var Comment 		= require('../models/comment');
var Subject 		= require('../models/subject');
var SubjectGroup 	= require('../models/subjectgroup');
var Category 		= require('../models/category');
var middleware 		= require('../middleware');
var	mongoosePaginate = require('mongoose-paginate');
var shortid 		= require('shortid32');
var	bodyParser 		= require('body-parser');
var mongoose 		= require('mongoose');
var wordCount		= require('word-count');
var	dotenv			= require('dotenv');
// var Uploader		= require('s3-image-uploader');

var resultsToShow = 10;

//	Configure DEV environment variables
dotenv.config({path: '.env'});				//	Loads environment variables file

//	Instantiate S3 Image Uploader
// var uploader = new Uploader({
// 	aws: {
// 		key: process.env.NODE_AWS_KEY,
// 		secret: process.env.NODE_AWS_SECRET
// 	},
// 	websockets: false
// });

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

//	INDEX BY POSTEDBY route 			-- Not currently in use (postAuthor links go to user profile instead).
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

//	IMAGE UPLOAD route


//	CREATE new finding route
router.post('/', middleware.isLoggedIn, function(req, res) {
	req.body.finding.shortID = shortid.generate();		// need to add in validation to ensure that shortid is available
	req.body.finding.datePosted = Date.now();
	req.body.finding.postAuthor = req.user._id;

	if(req.body.finding.imageURL) {
		req.body.finding.image = req.body.finding.imageURL;
	} else if (req.body.finding.imageUpload) {
		// console.log(req.body.finding.imageUpload);
		// var filename = shortid.generate();
		// uploader.upload({
		// 	fileId: filename,
		// 	bucket: process.env.S3_BUCKET,
		// 	source: req.body.finding.imageUpload,
		// 	name: filename
		// },
		// function(data) {
		// 	console.log('upload success: ', data);
		// },
		// function(errMsg, errObject) {
		// 	console.error('unable to upload: ' + errMsg + ' : ' + errObject);
		// });
	}

	if(req.body.finding.keywords) {
		if(!(Array.isArray(req.body.finding.keywords))) {
			req.body.finding.keywords = [req.body.finding.keywords];
		}
		req.body.finding.keywords_lower = req.body.finding.keywords.slice();
		keywordsToLower(req.body.finding.keywords_lower);
	}
	req.body.finding.citation.full = citationToString(req.body.finding);
	validateFinding(req);
	if(req.body.finding.failValidation) {
		res.redirect('back');
	} else {
		Finding.create(req.body.finding, function(err, finding) {
			if(err) {
				if(!(req.flash)) {
					req.flash("error", "Something went wrong...");
				}
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
	}
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
									res.redirect('back');
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
	
	//	If present, ensure keywords are in array & copy to keywords_lower
	if(req.body.finding.keywords) {
		if(!(Array.isArray(req.body.finding.keywords))) {
			req.body.finding.keywords = [req.body.finding.keywords];
		}
		req.body.finding.keywords_lower = req.body.finding.keywords.slice();
		keywordsToLower(req.body.finding.keywords_lower);
	}

	//	Update version edit user records, populate 'full string' citation
	req.body.finding.citation.full = citationToString(req.body.finding);
	req.body.finding.lastEditedBy = req.user._id;
	req.body.finding.lastEdited = Date.now();

	//	Validate Finding & update DB if passes
	validateFinding(req);
	if(req.body.finding.failValidation) {
		res.redirect('back');
	} else {

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

		//	Remove all preceded / followed by references to original Finding in other Findings, add new ones
		Finding.findById(req.params.id, function(err, originalFinding) {
			if(err) {
				req.flash("error", "Something went wrong...");
				res.redirect('/findings');
			} else {
				originalFollowedBy = originalFinding.followedBy.slice();
				originalPrecededBy = originalFinding.precededBy.slice();
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
			}
		});

		//	Update Finding in DB
		Finding.findByIdAndUpdate(req.params.id, req.body.finding, { runValidators: true }, function(err, findingPreUpdate) {
			if(err) {
				if(!(req.flash)) {
					req.flash("error", "Something went wrong...");
				}
				res.redirect('back');
			} else {
				//	Saves original Finding to Versions
				findingPreUpdate.ref = findingPreUpdate._id;
				findingPreUpdate._id = mongoose.Types.ObjectId();
				findingPreUpdate.isNew = true;
				Finding_version.create(findingPreUpdate, function(err, findingVersion) {
					if(err) {
						console.log(err);
						req.flash('error', 'Something went wrong...');
						res.redirect('/findings/' + req.params.id);
					} else {
						res.redirect('/findings/' + req.params.id);
					}
				});
			}
		});
	}
});


//	DELETE a finding (storing a copy to Versions)
router.delete('/:id', middleware.isUsersFinding, function(req, res) {
	Finding.findById(req.params.id, function(err, findingToDelete) {
		if(err) {
			req.flash("error", "Something went wrong...");
			res.redirect('/findings');
		} else {

			//	Remove preceded by / followed by references to this Finding in other documents
			//	Ensure followedBy & precededBy are Arrays
			if(!(findingToDelete.followedBy)) {
				findingToDelete.followedBy = [];
			} else if(!(Array.isArray(findingToDelete.followedBy))) {
				findingToDelete.followedBy = [findingToDelete.followedBy];
			}
			if(!(findingToDelete.precededBy)) {
				findingToDelete.precededBy = [];
			} else if(!(Array.isArray(findingToDelete.precededBy))) {
				findingToDelete.precededBy = [findingToDelete.precededBy];
			}
			findingToDelete.precededBy.forEach(function(pid) {
				Finding.findByIdAndUpdate(pid, { $pull: { "followedBy" : req.params.id }}, function(err) {
					if(err) {
						console.log(err);
					}
				});
			});
			findingToDelete.followedBy.forEach(function(pid) {
				Finding.findByIdAndUpdate(pid, { $pull: { "precededBy" : req.params.id }}, function(err) {
					if(err) {
						console.log(err);
					}
				});
			});

			//	Configure document and save as final Version
			findingToDelete.ref = findingToDelete._id;
			findingToDelete._id = mongoose.Types.ObjectId();
			findingToDelete.isNew = true;
			findingToDelete.deletedBy = req.user._id;
			findingToDelete.dateDeleted = Date.now();
			Finding_version.create(findingToDelete, function(err, createdFinding) {
				if(err) {
					console.log(err);
					req.flash('error', 'Something went wrong...');
					res.redirect('/findings');
				} else {
					Finding.findByIdAndRemove(req.params.id, function(err) {
						req.flash('success', 'Finding deleted successfully.');
						res.redirect('/findings');
					});
				}
			});
		}
	});
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

//	Display 'thread map' for a Finding
router.get('/threads/:id', function(req, res) {
	Finding.findById(req.params.id)
	.populate( [
	{ path: 'subject' }, 
	{ path: "precededBy", 
	populate: [ 
		{
			path: 'subject'
		}, {
			path: 'precededBy',
			populate: [
				{
					path: 'subject'
				}, {
					path: 'precededBy',
					populate: {
						path: 'subject'
					}
				}, {
					path: 'followedBy',
					populate: {
						path: 'subject'
					}
				}
			]
		}, {
			path: 'followedBy',
			populate: [
				{
					path: 'subject'
				}, {
					path: 'precededBy',
					populate: {
						path: 'subject'
					}
				}, {
					path: 'followedBy',
					populate: {
						path: 'subject'
					}
				}
			]
		}, 
	] },
	{ path: 'followedBy', 
	populate: [ 
		{
			path: 'subject'
		}, {
			path: 'precededBy',
			populate: [
				{
					path: 'subject'
				}, {
					path: 'precededBy',
					populate: {
						path: 'subject'
					}
				}, {
					path: 'followedBy',
					populate: {
						path: 'subject'
					}
				}
			]
		}, {
			path: 'followedBy',
			populate: [
				{
					path: 'subject'
				}, {
					path: 'precededBy',
					populate: {
						path: 'subject'
					}
				}, {
					path: 'followedBy',
					populate: {
						path: 'subject'
					}
				}
			]
		}
	]
	} ] )
	.exec(function(err, finding) {
		if(err) {
			req.flash("error", "Something went wrong...");
			res.redirect('back');
		} else if(!finding) {
			res.render('404');
		} else {
			var finding_ids = [];
			finding_ids.push(finding._id);
			if(typeof finding.followedBy !== 'undefined' && finding.followedBy.length > 0) {
				finding.followedBy.forEach(function(f) {
					finding_ids.push(f._id);
					if(typeof f.followedBy !== 'undefined' && f.followedBy.length > 0) {
						f.followedBy.forEach(function(g) {
							finding_ids.push(g._id);
							if(typeof g.followedBy !== 'undefined' && g.followedBy.length > 0) {
								g.followedBy.forEach(function(h) {
									finding_ids.push(h._id);
									if(typeof h.followedBy !== 'undefined' && h.followedBy.length > 0) {
										h.followedBy.forEach(function(i) {
											finding_ids.push(i);		//	Note the 4th level of recursion is not populated, contains ObjectIDs only
										});
									}
									if(typeof h.precededBy !== 'undefined' && h.precededBy.length > 0) {
										h.precededBy.forEach(function(i) {
											finding_ids.push(i);		//	Note the 4th level of recursion is not populated, contains ObjectIDs only
										});
									}
								});
							}
							if(typeof g.precededBy !== 'undefined' && g.precededBy.length > 0) {
								g.precededBy.forEach(function(h) {
									finding_ids.push(h._id);
									if(typeof h.followedBy !== 'undefined' && h.followedBy.length > 0) {
										h.followedBy.forEach(function(i) {
											finding_ids.push(i);
										});
									}
									if(typeof h.precededBy !== 'undefined' && h.precededBy.length > 0) {
										h.precededBy.forEach(function(i) {
											finding_ids.push(i);		//	Note the 4th level of recursion is not populated, contains ObjectIDs only
										});
									}
								});
							}
						})
					}
					if(typeof f.precededBy !== 'undefined' && f.precededBy.length > 0) {
						f.precededBy.forEach(function(g) {
							finding_ids.push(g._id);
							if(typeof g.followedBy !== 'undefined' && g.followedBy.length > 0) {
								g.followedBy.forEach(function(h) {
									finding_ids.push(h._id);
									if(typeof h.followedBy !== 'undefined' && h.followedBy.length > 0) {
										h.followedBy.forEach(function(i) {
											finding_ids.push(i);		//	Note the 4th level of recursion is not populated, contains ObjectIDs only
										});
									}
									if(typeof h.precededBy !== 'undefined' && h.precededBy.length > 0) {
										h.precededBy.forEach(function(i) {
											finding_ids.push(i);		//	Note the 4th level of recursion is not populated, contains ObjectIDs only
										});
									}
								});
							}
							if(typeof g.precededBy !== 'undefined' && g.precededBy.length > 0) {
								g.precededBy.forEach(function(h) {
									finding_ids.push(h._id);
									if(typeof h.followedBy !== 'undefined' && h.followedBy.length > 0) {
										h.followedBy.forEach(function(i) {
											finding_ids.push(i);
										});
									}
									if(typeof h.precededBy !== 'undefined' && h.precededBy.length > 0) {
										h.precededBy.forEach(function(i) {
											finding_ids.push(i);		//	Note the 4th level of recursion is not populated, contains ObjectIDs only
										});
									}
								});
							}
						})
					}
				});
			}
			if(typeof finding.precededBy !== 'undefined' && finding.precededBy.length > 0) {
				finding.precededBy.forEach(function(f) {
					finding_ids.push(f._id);
					if(typeof f.followedBy !== 'undefined' && f.followedBy.length > 0) {
						f.followedBy.forEach(function(g) {
							finding_ids.push(g._id);
							if(typeof g.followedBy !== 'undefined' && g.followedBy.length > 0) {
								g.followedBy.forEach(function(h) {
									finding_ids.push(h._id);
									if(typeof h.followedBy !== 'undefined' && h.followedBy.length > 0) {
										h.followedBy.forEach(function(i) {
											finding_ids.push(i);		//	Note the 4th level of recursion is not populated, contains ObjectIDs only
										});
									}
									if(typeof h.precededBy !== 'undefined' && h.precededBy.length > 0) {
										h.precededBy.forEach(function(i) {
											finding_ids.push(i);		//	Note the 4th level of recursion is not populated, contains ObjectIDs only
										});
									}
								});
							}
							if(typeof g.precededBy !== 'undefined' && g.precededBy.length > 0) {
								g.precededBy.forEach(function(h) {
									finding_ids.push(h._id);
									if(typeof h.followedBy !== 'undefined' && h.followedBy.length > 0) {
										h.followedBy.forEach(function(i) {
											finding_ids.push(i);
										});
									}
									if(typeof h.precededBy !== 'undefined' && h.precededBy.length > 0) {
										h.precededBy.forEach(function(i) {
											finding_ids.push(i);		//	Note the 4th level of recursion is not populated, contains ObjectIDs only
										});
									}
								});
							}
						})
					}
					if(typeof f.precededBy !== 'undefined' && f.precededBy.length > 0) {
						f.precededBy.forEach(function(g) {
							finding_ids.push(g._id);
							if(typeof g.followedBy !== 'undefined' && g.followedBy.length > 0) {
								g.followedBy.forEach(function(h) {
									finding_ids.push(h._id);
									if(typeof h.followedBy !== 'undefined' && h.followedBy.length > 0) {
										h.followedBy.forEach(function(i) {
											finding_ids.push(i);		//	Note the 4th level of recursion is not populated, contains ObjectIDs only
										});
									}
									if(typeof h.precededBy !== 'undefined' && h.precededBy.length > 0) {
										h.precededBy.forEach(function(i) {
											finding_ids.push(i);		//	Note the 4th level of recursion is not populated, contains ObjectIDs only
										});
									}
								});
							}
							if(typeof g.precededBy !== 'undefined' && g.precededBy.length > 0) {
								g.precededBy.forEach(function(h) {
									finding_ids.push(h._id);
									if(typeof h.followedBy !== 'undefined' && h.followedBy.length > 0) {
										h.followedBy.forEach(function(i) {
											finding_ids.push(i);
										});
									}
									if(typeof h.precededBy !== 'undefined' && h.precededBy.length > 0) {
										h.precededBy.forEach(function(i) {
											finding_ids.push(i);		//	Note the 4th level of recursion is not populated, contains ObjectIDs only
										});
									}
								});
							}
						})
					}
				});
			}
			console.log(finding_ids);
			var unique_ids = [];

			finding_ids.forEach(function(id){
				var uniq = true;
				for(var i = 0; i < unique_ids.length; i++) {
					if(id.equals(unique_ids[i])) {
						uniq = false;
					}
				}
				if(uniq) {
					unique_ids.push(id);
				}
			});

			Finding.find( { '_id': { $in: unique_ids } } )
			.populate({path: "subject"})
			.exec(function(err, threads) {
				if(err) {
					req.flash("error", "Something went wrong...");
					res.redirect('back');
				} else {
					console.log(threads);
					res.render('findings/threadMap', {finding: finding, threads: threads});
				}
			});
		};
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
	if(finding.citation.title.substr(finding.citation.title.length - 1) != '.') {
		fullString += '. ';
	}
	fullString += finding.citation.journal;
	if(finding.citation.journal.substr(finding.citation.journal.length - 1) != '.') {
		fullString += '. ';
	}
	fullString += finding.citation.year;
	fullString += ';';
	fullString += finding.citation.location;
	if(finding.citation.location.substr(finding.citation.location.length - 1) != '.') {
		fullString += '. ';
	}
	return(fullString);
}

function keywordsToLower(arr) {
	for(var i = 0; i < arr.length; i++) {
		arr[i] = arr[i].toLowerCase();
	}
}

function validateFinding(req) {			// 	Server side validation as protection against client-side failure or bypass
	if(!req.body.finding.title) {
		req.flash('error', 'You must enter a Title.');
	} else if(!req.body.finding.category) {
		req.flash('error', 'You must enter a Category.');
	} else if(!req.body.finding.subjectGroup) {
		req.flash('error', 'You must enter a Group.');
	} else if(!req.body.finding.subject) {
		req.flash('error', 'You must enter a Subject.');
	} else if(!req.body.finding.background) {
		req.flash('error', 'You cannot leave the Background field blank.');
	} else if(!req.body.finding.findings) {
		req.flash('error', 'You cannot leave the Findings field blank.');
	} else if(!req.body.finding.implications) {
		req.flash('error', 'You cannot leave the Implications field blank.');
	} else if(!req.body.finding.citation.authors) {
		req.flash('error', 'You must enter the author(s) of the original article.');
	} else if(!req.body.finding.citation.title) {
		req.flash('error', 'You must enter the title of the original article.');
	} else if(!req.body.finding.citation.journal) {
		req.flash('error', 'You must enter the journal in which the original article was published.');
	} else if(!req.body.finding.citation.year) {
		req.flash('error', 'You must enter the year in which the original article was published.');
	} else if(!req.body.finding.citation.location) {
		req.flash('error', 'You must enter the location at which the original article appears in the publishing journal.');
	} else if(wordCount(req.body.finding.background) > 200) {
		req.flash('error', "The 'Background' field must contain fewer than 200 hundred words - ideally no more than 150.");
		req.body.finding.failValidation = true;
	} else if(wordCount(req.body.finding.findings) > 200) {
		req.flash('error', "The 'Findings' field must contain fewer than 200 hundred words - ideally no more than 150.");
		req.body.finding.failValidation = true;
	} else if(wordCount(req.body.finding.implications) > 200) {
		req.flash('error', "The 'Implications' field must contain fewer than 200 hundred words - ideally no more than 150.");
		req.body.finding.failValidation = true;
	}
}

module.exports = router;
