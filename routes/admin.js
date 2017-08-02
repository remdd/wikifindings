var express = require('express');
var router 	= express.Router();
var middleware 	= require('../middleware');
var Subject 		= require('../models/subject');
var SubjectGroup 	= require('../models/subjectgroup');
var Category 		= require('../models/category');


//	ADMIN routes ********************
//	DEV todo list //
router.get('/todo', middleware.isAdministrator, function(req, res) {
	res.render('admin/todo');
});

//	Category styling //
router.get('/styles', function(req, res) {
	Category.find({}, function(err, categories) {
		if(err) {
			console.log(err);
			res.redirect('back');
		} else {
			res.render('admin/categoryStyling', {categories: categories});
		}
	}).populate({path: 'subjectGroups', populate: {path: 'subjects'}});
});


//	UPDATE category route
router.put('/styles/category', function(req, res) {
	console.log(req.params);
	Category.findByIdAndUpdate(req.params.category._id, req.body.category, function(err, updatedCategory) {
		if(err) {
			console.log(err);
			res.redirect("back");
		} else {
			res.redirect("/styles");
		}
	});
});





module.exports = router;