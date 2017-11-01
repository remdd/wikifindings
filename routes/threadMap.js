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


//	Display 'thread map' for a Finding
router.get('/:n&:id', function(req, res) {
	console.log(req.params);
	var threads = {};
	Finding.findById(req.params.id)
	.exec(function(err, finding) {
		if(err) {
			req.flash("error", "Something went wrong...");
			res.redirect('back');
		} else {
			console.log(threads);
			res.render('findings/threadMap', {finding: finding, threads: threads});
		}
	});
});

















//	Display 'thread map' for a Finding
router.get('/:id', function(req, res) {
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
			.populate({path: "postAuthor"})
			.exec(function(err, threads) {
				if(err) {
					req.flash("error", "Something went wrong...");
					res.redirect('back');
				} else {
					res.render('findings/threadMap', {finding: finding, threads: threads});
				}
			});
		};
	});
});

module.exports = router;