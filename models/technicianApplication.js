var mongoose = require('mongoose');
// define schema
var technicianApplicationSchema = mongoose.Schema({
    category: String,
    firstName: String,
    lastName: String,
    location: String,
    phoneNumber: {type: String, minlength: 13, maxlength: 13},
    phoneNumber2: {type: String, minlength: 13, maxlength: 13},
    idNumber: {type: String, minlength: 8, maxlength: 8},
    aboutMe: String,
    picked: { type: Boolean, default: false }
});

// compile model

var TechnicianApplication = mongoose.model('TechnicianApplication', technicianApplicationSchema);

//express settings
module.exports = TechnicianApplication;