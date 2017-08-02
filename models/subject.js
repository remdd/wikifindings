var mongoose = require("mongoose");

var SubjectSchema = new mongoose.Schema({
	subjectName: String,
	subjectColor: String
});

module.exports = mongoose.model("Subject", SubjectSchema);