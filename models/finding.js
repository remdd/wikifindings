var mongoose = require("mongoose");
var	mongoosePaginate = require('mongoose-paginate');

//	Mongoose schema
var findingSchema = new mongoose.Schema({
	title: String,
	category: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "Category"
	},
	subjectGroup: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "SubjectGroup"
	},
	subject: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "Subject"
	},
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
	postAuthor: {
		id: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User"			//	ref: name of the mongoose schema model
		},
		username: String
	},
	precededBy: [
		{
			type: mongoose.Schema.Types.ObjectId,
			ref: "Finding"
		}
	],
	followedBy: [
		{
			type: mongoose.Schema.Types.ObjectId,
			ref: "Finding"
		}
		],
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
