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

//	Remove identical objectIDs from an array
function dedupeIDs(objectIDs) {
	const ids = {};
	objectIDs.forEach(_id => (ids[_id.toString()] = _id));
	return Object.values(ids);
}

//	Display 'thread map' for a Finding
router.get('/:n&:id', function(req, res) {

	//	Set levels of recursion (ie degrees of separation from Finding at origin)
	var n_levels;
	if(req.params.n.isNAN) {
		n_levels = 3;
	} else if(req.params.n > 5) {
		n_levels = 5;
	} else if(req.params.n < 1) {
		n_levels = 1;
	} else {
		n_levels = req.params.n;
	}
	console.log("n: " + n_levels);

	//	Array to contain all Finding IDs to be returned
	var threads = [];

	//	Object to hold copy of Origin finding
	var origin = {};

	//	Find original Finding & call findRelatives recursively on its relatives
	Finding.findById(req.params.id)
	.exec(function(err, finding) {
		if(err) {
			console.log(err);
			req.flash("error", "Something went wrong...");
			res.redirect('back');
		} else {
			origin = finding;
			var relatives = [];
			if (typeof finding.followedBy !== 'undefined' && finding.followedBy.length > 0) {
				relatives = relatives.concat(finding.followedBy);
			}
			if (typeof finding.precededBy !== 'undefined' && finding.precededBy.length > 0) {
				relatives = relatives.concat(finding.precededBy);
			}
			console.log("Relatives of Origin Finding:")
			console.log(relatives);
			console.log("***********************");
			relatives = dedupeIDs(relatives);
			console.log("Unique relatives of Origin Finding:")
			console.log(relatives);
			console.log("***********************");
			threads = threads.concat(relatives);
			findRelatives(threads);
		}
	});

	function findRelatives(arr) {
		n_levels -= 1;
		if(n_levels > 0) {
			console.log("n_level: " + n_levels);
			relatives = [];
			Finding.find( { '_id': { $in: arr } } )
			.exec(function(err, findings) {
				if(err) {
					console.log(err);
					req.flash("error", "Something went wrong...");
					res.redirect('back');
				} else {
					findings.forEach(function(finding) {
						if (typeof finding.followedBy !== 'undefined' && finding.followedBy.length > 0) {
							relatives = relatives.concat(finding.followedBy);
						}
						if (typeof finding.precededBy !== 'undefined' && finding.precededBy.length > 0) {
							relatives = relatives.concat(finding.precededBy);
						}
					});
					relatives = dedupeIDs(relatives);
					console.log("Adding " + relatives.length + " relatives...");
					console.log(relatives);
					threads = threads.concat(relatives);
					findRelatives(relatives);
				}
			});
		} else {
			threads = dedupeIDs(threads);
			console.log("* * * * * * * * * *");
			console.log("FINAL THREAD ID ARRAY:");
			console.log(threads);
			Finding.find( { '_id': { $in: threads } } )
			.populate( "subject" )
			.populate( "postAuthor", 'username' )
			.exec(function(err, threads) {
				if(err) {
					req.flash("error", "Something went wrong...");
					res.redirect('back');
				} else {
					res.render('findings/threadMap', {finding: origin, threads: threads});
				}
			});
		}
	}



// //	Display 'thread map' for a Finding
// router.get('/:id', function(req, res) {
// 	Finding.findById(req.params.id)
// 	.populate( [
// 	{ path: 'subject' }, 
// 	{ path: "precededBy", 
// 	populate: [ 
// 		{
// 			path: 'subject'
// 		}, {
// 			path: 'precededBy',
// 			populate: [
// 				{
// 					path: 'subject'
// 				}, {
// 					path: 'precededBy',
// 					populate: {
// 						path: 'subject'
// 					}
// 				}, {
// 					path: 'followedBy',
// 					populate: {
// 						path: 'subject'
// 					}
// 				}
// 			]
// 		}, {
// 			path: 'followedBy',
// 			populate: [
// 				{
// 					path: 'subject'
// 				}, {
// 					path: 'precededBy',
// 					populate: {
// 						path: 'subject'
// 					}
// 				}, {
// 					path: 'followedBy',
// 					populate: {
// 						path: 'subject'
// 					}
// 				}
// 			]
// 		}, 
// 	] },
// 	{ path: 'followedBy', 
// 	populate: [ 
// 		{
// 			path: 'subject'
// 		}, {
// 			path: 'precededBy',
// 			populate: [
// 				{
// 					path: 'subject'
// 				}, {
// 					path: 'precededBy',
// 					populate: {
// 						path: 'subject'
// 					}
// 				}, {
// 					path: 'followedBy',
// 					populate: {
// 						path: 'subject'
// 					}
// 				}
// 			]
// 		}, {
// 			path: 'followedBy',
// 			populate: [
// 				{
// 					path: 'subject'
// 				}, {
// 					path: 'precededBy',
// 					populate: {
// 						path: 'subject'
// 					}
// 				}, {
// 					path: 'followedBy',
// 					populate: {
// 						path: 'subject'
// 					}
// 				}
// 			]
// 		}
// 	]
// 	} ] )
// 	.exec(function(err, finding) {
// 		if(err) {
// 			req.flash("error", "Something went wrong...");
// 			res.redirect('back');
// 		} else if(!finding) {
// 			res.render('404');
// 		} else {
// 			var finding_ids = [];

// 			finding_ids.push(finding._id);
// 			if(typeof finding.followedBy !== 'undefined' && finding.followedBy.length > 0) {
// 				finding.followedBy.forEach(function(f) {
// 					finding_ids.push(f._id);
// 					if(typeof f.followedBy !== 'undefined' && f.followedBy.length > 0) {
// 						f.followedBy.forEach(function(g) {
// 							finding_ids.push(g._id);
// 							if(typeof g.followedBy !== 'undefined' && g.followedBy.length > 0) {
// 								g.followedBy.forEach(function(h) {
// 									finding_ids.push(h._id);
// 									if(typeof h.followedBy !== 'undefined' && h.followedBy.length > 0) {
// 										h.followedBy.forEach(function(i) {
// 											finding_ids.push(i);		//	Note the 4th level of recursion is not populated, contains ObjectIDs only
// 										});
// 									}
// 									if(typeof h.precededBy !== 'undefined' && h.precededBy.length > 0) {
// 										h.precededBy.forEach(function(i) {
// 											finding_ids.push(i);		//	Note the 4th level of recursion is not populated, contains ObjectIDs only
// 										});
// 									}
// 								});
// 							}
// 							if(typeof g.precededBy !== 'undefined' && g.precededBy.length > 0) {
// 								g.precededBy.forEach(function(h) {
// 									finding_ids.push(h._id);
// 									if(typeof h.followedBy !== 'undefined' && h.followedBy.length > 0) {
// 										h.followedBy.forEach(function(i) {
// 											finding_ids.push(i);
// 										});
// 									}
// 									if(typeof h.precededBy !== 'undefined' && h.precededBy.length > 0) {
// 										h.precededBy.forEach(function(i) {
// 											finding_ids.push(i);		//	Note the 4th level of recursion is not populated, contains ObjectIDs only
// 										});
// 									}
// 								});
// 							}
// 						})
// 					}
// 					if(typeof f.precededBy !== 'undefined' && f.precededBy.length > 0) {
// 						f.precededBy.forEach(function(g) {
// 							finding_ids.push(g._id);
// 							if(typeof g.followedBy !== 'undefined' && g.followedBy.length > 0) {
// 								g.followedBy.forEach(function(h) {
// 									finding_ids.push(h._id);
// 									if(typeof h.followedBy !== 'undefined' && h.followedBy.length > 0) {
// 										h.followedBy.forEach(function(i) {
// 											finding_ids.push(i);		//	Note the 4th level of recursion is not populated, contains ObjectIDs only
// 										});
// 									}
// 									if(typeof h.precededBy !== 'undefined' && h.precededBy.length > 0) {
// 										h.precededBy.forEach(function(i) {
// 											finding_ids.push(i);		//	Note the 4th level of recursion is not populated, contains ObjectIDs only
// 										});
// 									}
// 								});
// 							}
// 							if(typeof g.precededBy !== 'undefined' && g.precededBy.length > 0) {
// 								g.precededBy.forEach(function(h) {
// 									finding_ids.push(h._id);
// 									if(typeof h.followedBy !== 'undefined' && h.followedBy.length > 0) {
// 										h.followedBy.forEach(function(i) {
// 											finding_ids.push(i);
// 										});
// 									}
// 									if(typeof h.precededBy !== 'undefined' && h.precededBy.length > 0) {
// 										h.precededBy.forEach(function(i) {
// 											finding_ids.push(i);		//	Note the 4th level of recursion is not populated, contains ObjectIDs only
// 										});
// 									}
// 								});
// 							}
// 						})
// 					}
// 				});
// 			}
// 			if(typeof finding.precededBy !== 'undefined' && finding.precededBy.length > 0) {
// 				finding.precededBy.forEach(function(f) {
// 					finding_ids.push(f._id);
// 					if(typeof f.followedBy !== 'undefined' && f.followedBy.length > 0) {
// 						f.followedBy.forEach(function(g) {
// 							finding_ids.push(g._id);
// 							if(typeof g.followedBy !== 'undefined' && g.followedBy.length > 0) {
// 								g.followedBy.forEach(function(h) {
// 									finding_ids.push(h._id);
// 									if(typeof h.followedBy !== 'undefined' && h.followedBy.length > 0) {
// 										h.followedBy.forEach(function(i) {
// 											finding_ids.push(i);		//	Note the 4th level of recursion is not populated, contains ObjectIDs only
// 										});
// 									}
// 									if(typeof h.precededBy !== 'undefined' && h.precededBy.length > 0) {
// 										h.precededBy.forEach(function(i) {
// 											finding_ids.push(i);		//	Note the 4th level of recursion is not populated, contains ObjectIDs only
// 										});
// 									}
// 								});
// 							}
// 							if(typeof g.precededBy !== 'undefined' && g.precededBy.length > 0) {
// 								g.precededBy.forEach(function(h) {
// 									finding_ids.push(h._id);
// 									if(typeof h.followedBy !== 'undefined' && h.followedBy.length > 0) {
// 										h.followedBy.forEach(function(i) {
// 											finding_ids.push(i);
// 										});
// 									}
// 									if(typeof h.precededBy !== 'undefined' && h.precededBy.length > 0) {
// 										h.precededBy.forEach(function(i) {
// 											finding_ids.push(i);		//	Note the 4th level of recursion is not populated, contains ObjectIDs only
// 										});
// 									}
// 								});
// 							}
// 						})
// 					}
// 					if(typeof f.precededBy !== 'undefined' && f.precededBy.length > 0) {
// 						f.precededBy.forEach(function(g) {
// 							finding_ids.push(g._id);
// 							if(typeof g.followedBy !== 'undefined' && g.followedBy.length > 0) {
// 								g.followedBy.forEach(function(h) {
// 									finding_ids.push(h._id);
// 									if(typeof h.followedBy !== 'undefined' && h.followedBy.length > 0) {
// 										h.followedBy.forEach(function(i) {
// 											finding_ids.push(i);		//	Note the 4th level of recursion is not populated, contains ObjectIDs only
// 										});
// 									}
// 									if(typeof h.precededBy !== 'undefined' && h.precededBy.length > 0) {
// 										h.precededBy.forEach(function(i) {
// 											finding_ids.push(i);		//	Note the 4th level of recursion is not populated, contains ObjectIDs only
// 										});
// 									}
// 								});
// 							}
// 							if(typeof g.precededBy !== 'undefined' && g.precededBy.length > 0) {
// 								g.precededBy.forEach(function(h) {
// 									finding_ids.push(h._id);
// 									if(typeof h.followedBy !== 'undefined' && h.followedBy.length > 0) {
// 										h.followedBy.forEach(function(i) {
// 											finding_ids.push(i);
// 										});
// 									}
// 									if(typeof h.precededBy !== 'undefined' && h.precededBy.length > 0) {
// 										h.precededBy.forEach(function(i) {
// 											finding_ids.push(i);		//	Note the 4th level of recursion is not populated, contains ObjectIDs only
// 										});
// 									}
// 								});
// 							}
// 						})
// 					}
// 				});
// 			}
// 			var unique_ids = [];

// 			finding_ids.forEach(function(id){
// 				var uniq = true;
// 				for(var i = 0; i < unique_ids.length; i++) {
// 					if(id.equals(unique_ids[i])) {
// 						uniq = false;
// 					}
// 				}
// 				if(uniq) {
// 					unique_ids.push(id);
// 				}
// 			});

// 			Finding.find( { '_id': { $in: unique_ids } } )
// 			.populate({path: "subject"})
// 			.populate( "postAuthor", 'username' )
// 			.exec(function(err, threads) {
// 				if(err) {
// 					req.flash("error", "Something went wrong...");
// 					res.redirect('back');
// 				} else {
// 					console.log(threads);
// 					res.render('findings/threadMap', {finding: finding, threads: threads});
// 				}
// 			});
// 		};
// 	});



});

module.exports = router;