var mongoose = require("mongoose");

var SubjectSchema = new mongoose.Schema({
	subjectName: { type: String, required: true, unique: true },
	subjectColor: String
});

module.exports = mongoose.model("Subject", SubjectSchema);