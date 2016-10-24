// define schema
var mongoose = require('mongoose');
var passportLocalMongoose = require('passport-local-mongoose');

var adminSchema = mongoose.Schema({
    username: {type: String, required: true},
    password: String,
    email: {type: String, required: true}
    });

// set plugin
adminSchema.plugin(passportLocalMongoose);

// compile model
var Admin = mongoose.model('Admin', adminSchema);
//express settings
module.exports = Admin;