var mongoose = require("mongoose");

var commentSchema = mongoose.Schema({
	text: String,
	author: String,
	datePosted: Date,
	dateEdited: Date
});

module.exports = mongoose.model("Comment", commentSchema);
