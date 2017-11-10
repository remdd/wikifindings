var mongoose = require("mongoose");
var	mongoosePaginate = require('mongoose-paginate');

//	Mongoose schema
var findingSchema = new mongoose.Schema({
	ref: { type: mongoose.Schema.Types.ObjectId },
	shortID: { type: String, required: true, unique: true },
	title: { type: String, required: true, unique: true },
	category: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "Category",
		required: true
	},
	subjectGroup: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "SubjectGroup",
		required: true
	},
	subject: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "Subject",
		required: true
	},
	keywords: Array,
	keywords_lower: Array,
	background: { type: String, required: true },
	findings: { type: String, required: true },
	implications: { type: String, required: true },
	image: String,
	citation: {
		full: String,
		authors: { type: Array, required: true },
		year: { type: String, required: true },
		title: { type: String, required: true },
		journal: { type: String, required: true },
		location: { type: String, required: true },
		link: { type: String, required: false },
		DOI: { type: String, required: true, unique: true }
	},
	postAuthor: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "User",			//	ref: name of the mongoose schema model
		required: true
	},
	datePosted: { type: Date, required: true },
	lastEditedBy: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "User",
		required: false
	},
	lastEdited: { type: Date, required: false },
	deletedBy: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "User",
		required: false
	},
	dateDeleted: { type: Date, required: false },
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
