var express 		= require('express');
var router 			= express.Router();
var middleware 		= require('../middleware');
var Subject 		= require('../models/subject');
var SubjectGroup 	= require('../models/subjectgroup');
var Category 		= require('../models/category');


//	ADMIN routes ********************
//	DEV todo list //
router.get('/todo', middleware.isAdministrator, function(req, res) {
	res.render('admin/todo');
});

//	Category styling //
router.get('/tree', function(req, res) {
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
							res.render('admin/subjectTree', {categories: categories, subjectGroups: subjectGroups, subjects: subjects});
						}
					})
				}
			}).populate({path: 'subjects'});
		}
	}).populate({path: 'subjectGroups', populate: {path: 'subjects'}});
});

//	EDIT a Category
router.get('/tree/categories', function(req, res) {
	Category.findById(req.query.category, function(err, shownCategory) {
		if(err) {
			req.flash("error", "Something went wrong...");
			res.redirect('/tree');
		} else {
			res.render('admin/updatecategory', {category: shownCategory});
		}
	});
});
//	UPDATE a Category
router.put('/tree/categories/:id', function(req, res) {
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

//	EDIT a Subject Group
router.get('/tree/subjectGroups', function(req, res) {
	SubjectGroup.findById(req.query.subjectGroup, function(err, shownSubjectGroup) {
		if(err) {
			req.flash("error", "Something went wrong...");
			res.redirect('/tree');
		} else {
			res.render('admin/updatesubjectgroup', {subjectGroup: shownSubjectGroup});
		}
	});
});
//	UPDATE a Subject Group
router.put('/tree/subjectGroups/:id', function(req, res) {
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

//	EDIT a Subject
router.get('/tree/subjects', function(req, res) {
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
router.put('/tree/subjects/:id', function(req, res) {
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



module.exports = router;