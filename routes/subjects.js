var express 		= require('express');
var router 			= express.Router();
var Subject 		= require('../models/subject');
var SubjectGroup 	= require('../models/subjectgroup');
var Category 		= require('../models/category');
var middleware 		= require('../middleware');
var	mongoosePaginate = require('mongoose-paginate');


//	Subject tree //
router.get('/', function(req, res) {
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
							res.render('findings/subjects', {categories: categories, subjectGroups: subjectGroups, subjects: subjects});
						}
					})
				}
			}).populate({path: 'subjects', options: { sort: 'subjectName'}});
		}
	}).populate({path: 'subjectGroups', options: { sort: 'subjectGroupName'}, populate: {path: 'subjects', options: { sort: 'subjectName'}}}).sort({'categoryName': 'asc'});
});

//	Subject tree //
router.get('/:group', function(req, res) {
	console.log(req.params.group);
	SubjectGroup.findOne({ subjectGroupName: req.params.group }, function(err, subjectGroup) {
		if(err) {
			console.log(err);
			req.flash('error', 'Something went wrong...');
			res.redirect('back');
		} else {
			res.render('findings/subjectGroup', {subjectGroup: subjectGroup});
		}
	}).populate({path: 'subjects', options: { sort: 'subjectName'}});
});


module.exports = router;
