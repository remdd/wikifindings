var mongoose = require("mongoose");

var SubjectGroupSchema = new mongoose.Schema({
	subjectGroupName: String,
	subjectGroupColor: String,
	subjectGroups: [{
		type: mongoose.Schema.Types.ObjectId,
		ref: "Subject"
	}]
});

module.exports = mongoose.model("SubjectGroup", SubjectGroupSchema, "subjectgroups");