var mongoose = require("mongoose");

var SubjectGroupSchema = new mongoose.Schema({
	subjectGroupName: { type: String, required: true, unique: true },
	subjectGroupColor: String,
	description: { type: String, required: false },
	subjects: [{
		type: mongoose.Schema.Types.ObjectId,
		ref: "Subject"
	}]
});

module.exports = mongoose.model("SubjectGroup", SubjectGroupSchema, "subjectgroups");