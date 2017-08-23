var express 		= require('express');
var router 			= express.Router();
var middleware 		= require('../middleware');
var Subject 		= require('../models/subject');
var SubjectGroup 	= require('../models/subjectgroup');
var Category 		= require('../models/category');
var Finding 		= require('../models/finding');


//	ADMIN routes ********************
//	DEV todo list //
router.get('/todo', middleware.isAdministrator, function(req, res) {
	res.render('admin/todo');
});

//	Subject tree //
router.get('/tree', middleware.isAdministrator, function(req, res) {
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
							Finding.find({})
							.populate({path: "category"})
							.populate({path: "subjectGroup"})
							.populate({path: "subject"})
							.exec(function(err, allFindings) {
								if(err) {
									console.log(err);
									res.redirect('back');
								} else {
									res.render('admin/subjectTree', {categories: categories, subjectGroups: subjectGroups, subjects: subjects , allFindings: allFindings});
								}
							});
						}
					});
				}
			}).populate({path: 'subjects', options: { sort: 'subjectName'}});
		}
	}).populate({path: 'subjectGroups', options: { sort: 'subjectGroupName'}, populate: {path: 'subjects', options: { sort: 'subjectName'}}}).sort({'categoryName': 'asc'});
});

//	EDIT a Category
router.get('/tree/categories', middleware.isAdministrator, function(req, res) {
	Category.findById(req.query.category, function(err, shownCategory) {
		if(err) {
			req.flash("error", "Something went wrong...");
			res.redirect('/tree');
		} else {
			SubjectGroup.find({}, function(err, subjectGroups) {
				if(err) {
					console.log(err);
				} else {
					res.render('admin/updatecategory', {category: shownCategory, subjectGroups: subjectGroups});
				}
			});
		}
	}).populate({path: 'subjectGroups'});
});
//	UPDATE a Category
router.put('/tree/categories/:id', middleware.isAdministrator, function(req, res) {
	Category.findByIdAndUpdate(req.params.id, req.body.category, function(err, updatedCategory) {
		if(err) {
			req.flash("error", "Something went wrong...");
			res.redirect('/tree');
		} else {
			req.flash("success", "Successfully updated Category");
			res.redirect('/tree');
		}
	});
});
//	CREATE a Category
router.post('/tree/categories', middleware.isAdministrator, function(req, res) {
	Category.create(req.body.category, function(err, finding) {
		if(err) {
			req.flash("error", "Something went wrong...");
			res.redirect('/tree');
		} else {
			req.flash("success", "Successfully added a new Category");
			res.redirect('/tree');
		}
	});
});


//	EDIT a Subject Group
router.get('/tree/subjectGroups', middleware.isAdministrator, function(req, res) {
	SubjectGroup.findById(req.query.subjectGroup, function(err, shownSubjectGroup) {
		if(err) {
			req.flash("error", "Something went wrong...");
			res.redirect('/tree');
		} else {
			Subject.find({}, function(err, subjects) {
				if(err) {
					console.log(err);
				} else {
					res.render('admin/updatesubjectgroup', {subjectGroup: shownSubjectGroup, subjects: subjects});
				}
			});
		}
	}).populate({path: 'subjects'});
});
//	UPDATE a Subject Group
router.put('/tree/subjectGroups/:id', middleware.isAdministrator, function(req, res) {
	SubjectGroup.findByIdAndUpdate(req.params.id, req.body.subjectGroup, function(err, updatedSubjectGroup) {
		if(err) {
			req.flash("error", "Something went wrong...");
			res.redirect('/tree');
		} else {
			req.flash("success", "Successfully updated Subject Group");
			res.redirect('/tree');
		}
	});
});
//	CREATE a Subject Group
router.post('/tree/subjectGroups', middleware.isAdministrator, function(req, res) {
	SubjectGroup.create(req.body.subjectGroup, function(err, finding) {
		if(err) {
			req.flash("error", "Something went wrong...");
			res.redirect('/tree');
		} else {
			req.flash("success", "Successfully added a new Subject Group");
			res.redirect('/tree');
		}
	});
});

//	EDIT a Subject
router.get('/tree/subjects', middleware.isAdministrator, function(req, res) {
	Subject.findById(req.query.subject, function(err, shownSubject) {
		if(err) {
			req.flash("error", "Something went wrong...");
			res.redirect('/tree');
		} else {
			res.render('admin/updatesubject', {subject: shownSubject});
		}
	});
});
//	UPDATE a Subject
router.put('/tree/subjects/:id', middleware.isAdministrator, function(req, res) {
	console.log("Updating!");
	Subject.findByIdAndUpdate(req.params.id, req.body.subject, function(err, updatedSubject) {
		if(err) {
			req.flash("error", "Something went wrong...");
			res.redirect('/tree');
		} else {
			req.flash("success", "Successfully updated Subject");
			res.redirect('/tree');
		}
	});
});
//	CREATE a Subject
router.post('/tree/subjects', middleware.isAdministrator, function(req, res) {
	Subject.create(req.body.subject, function(err, finding) {
		if(err) {
			req.flash("error", "Something went wrong...");
			res.redirect('/tree');
		} else {
			req.flash("success", "Successfully added a new Subject");
			res.redirect('/tree');
		}
	});
});

router.get('/session', function(req, res) {
	console.log(req.cookies);
	console.log("***************************");
	console.log(req.session);
	res.render('about');
});

module.exports = router;