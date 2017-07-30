var mongoose = require("mongoose");

//	Mongoose schema
var findingSchema = new mongoose.Schema({
	title: String,
	category: String,
	subjectGroup: String,
	subject: String,
	keywords: Array,
	background: String,
	findings: String,
	implications: String,
	image: String,
	datePosted: Date,
	citation: String,
	citationLink: String,
	citationDOI: String,
	precededBy: Array,
	postAuthor: {
		id: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User"			//	ref: name of the mongoose schema model
		},
		username: String
	},
	comments: [
		{
			type: mongoose.Schema.Types.ObjectId,
			ref: "Comment"
		}
	]
});

//	Compile 'finding' mongoose model from schema & return model
module.exports = mongoose.model("Finding", findingSchema);
