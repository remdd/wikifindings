var mongoose = require("mongoose");
var passportLocalMongoose = require("passport-local-mongoose");
var bcrypt = require("bcrypt-nodejs");

var UserSchema = new mongoose.Schema({
	username: { type: String, required: true, unique: true },
	password: { type: String },
	email: { type: String, required: true, unique: true },
	isScientist: { type: Boolean, default: false },
	isVerifiedScientist: { type: Boolean, default: false },
	isAdministrator: { type: Boolean, default: false },

	//	Password reset email variables
	resetPasswordToken: String,
	resetPasswordExpires: Date
});

//	Adds local passport methods to mongoose schema
UserSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User", UserSchema);
