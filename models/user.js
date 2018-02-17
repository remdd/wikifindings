var mongoose = require("mongoose");
var passportLocalMongooseEmail = require("passport-local-mongoose-email");
var bcrypt = require("bcrypt-nodejs");

var UserSchema = new mongoose.Schema({
	username: { type: String, required: true, unique: true },
	password: { type: String },
	email: { type: String, required: true, unique: true },
	ORCIDiD: { type: String, required: false, unique: true }, 
	publicBio: { type: String, required: false },
	isScientist: { type: Boolean, default: false },
	isVerifiedScientist: { type: Boolean, default: false },
	isAdministrator: { type: Boolean, default: false },

	//	Login tracking
	loginCount: Number,
	lastLoginDate: Date,

	//	Password reset email variables
	resetPasswordToken: String,
	resetPasswordExpires: Date
});

//	Adds local passport methods to mongoose schema
UserSchema.plugin(passportLocalMongooseEmail, {
	usernameField: 'email'
});

module.exports = mongoose.model("User", UserSchema);
