// define schema
var mongoose = require('mongoose');
var taskSchema = mongoose.Schema({
    category: String,
    firstname: String,
    lastname: String,
    email: String,
    location: String,
    phoneNumber: {type: String, minlength: 13, maxlength: 13},
    description: String,
    quotedPrice: String,
    availability: String,
});

// compile model

var Task = mongoose.model('Task', taskSchema);
//express settings
module.exports = Task;