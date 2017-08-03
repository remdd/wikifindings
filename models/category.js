var mongoose = require("mongoose");

var CategorySchema = new mongoose.Schema({
	categoryName: { type: String, required: true, unique: true },
	categoryColor: String,
	subjectGroups: [{
		type: mongoose.Schema.Types.ObjectId,
		ref: "SubjectGroup"
	}]
});

module.exports = mongoose.model("Category", CategorySchema, "categories");			// 3rd parameter specifies name of collection