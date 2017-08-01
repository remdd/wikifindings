var mongoose = require("mongoose");
var	mongoosePaginate = require('mongoose-paginate');

//	Mongoose schema
var findingSchema = new mongoose.Schema({
	title: String,
	category: String,
	subjectGroup: String,
	subject: String,
	keywords: Array,
	keywords_lower: Array,
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

findingSchema.plugin(mongoosePaginate);

//	Compile 'finding' mongoose model from schema & return model
module.exports = mongoose.model("Finding", findingSchema);
