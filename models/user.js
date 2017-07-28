var mongoose = require("mongoose");
var passportLocalMongoose = require("passport-local-mongoose");

var UserSchema = new mongoose.Schema({
	username: String,
	password: String,
	email: String,
	isScientist: Boolean,
	isVerifiedScientist: Boolean,
	isAdministrator: Boolean
});

//	Adds local passport methods to mongoose schema
UserSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User", UserSchema);
