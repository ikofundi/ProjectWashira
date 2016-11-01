// define schema
var mongoose = require('mongoose');
var passportLocalMongoose = require('passport-local-mongoose');

var accesorSchema = mongoose.Schema({
    username: {type: String, required: true},
    password: String,
    email: {type: String, required: true},
   
    });
	

// set plugin
accesorSchema.plugin(passportLocalMongoose);

// compile model
var Accesor = mongoose.model('Accesor', accesorSchema);
//express settings
module.exports = Accesor;