var mongoose = require("mongoose");

//	Mongoose schema
var findingSchema = new mongoose.Schema({
	title: String,
	category: String,
	subject: String,
	keywords: Array,
	background: String,
	findings: String,
	implications: String,
	image: String,
	postAuthor: String,
	datePosted: Date,
	citation: String,
	citationLink: String,
	citationDOI: String,
	comments: [
		{
			type: mongoose.Schema.Types.ObjectId,
			//	ref = name of the Comment model
			ref: "Comment"
		}
	]
});

//	Compile 'finding' mongoose model from schema & return model
module.exports = mongoose.model("Finding", findingSchema);
