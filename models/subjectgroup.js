var mongoose = require("mongoose");

var SubjectGroupSchema = new mongoose.Schema({
	subjectGroupName: String,
	subjectGroupColor: String,
	subjects: [{
		type: mongoose.Schema.Types.ObjectId,
		ref: "Subject"
	}]
});

module.exports = mongoose.model("SubjectGroup", SubjectGroupSchema, "subjectgroups");