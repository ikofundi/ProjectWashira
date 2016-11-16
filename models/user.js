// define schema
var mongoose = require('mongoose');
var passportLocalMongoose = require('passport-local-mongoose');

var userSchema = mongoose.Schema({
    username: {type: String, required: true},
    password: String,
    email: {type: String, required: true},
    phonenumber: {type: String, minlength: 13 , required: true},
    jobId: String,
    isAdmin: { type: Boolean, default: false },
    isAccesor: { type: Boolean, default: false },
    isTechnician: { type: Boolean, default: false },
    resetPasswordToken: String,
  	resetPasswordExpires: Date
    });
	
userSchema.pre('save', function(next) {
  var user = this;
  var SALT_FACTOR = 5;

  if (!user.isModified('password')) return next();

  bcrypt.genSalt(SALT_FACTOR, function(err, salt) {
    if (err) return next(err);

    bcrypt.hash(user.password, salt, null, function(err, hash) {
      if (err) return next(err);
      user.password = hash;
      next();
    });
  });
});

userSchema.methods.comparePassword = function(candidatePassword, cb) {
  bcrypt.compare(candidatePassword, this.password, function(err, isMatch) {
    if (err) return cb(err);
    cb(null, isMatch);
  });
};
// set plugin
userSchema.plugin(passportLocalMongoose);

// compile model
var User = mongoose.model('User', userSchema);
//express settings
module.exports = User;