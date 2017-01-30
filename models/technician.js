var mongoose = require('mongoose');
// define schema
var technicianSchema = mongoose.Schema({
    category: String,
    firstName: String,
    lastName: String,
    email: String,
    location: String,
    phoneNumber: {type: String, minlength: 13, maxlength: 13},
    idNumber: {type: String, minlength: 8, maxlength: 8},
    
});

// compile model

var Technician = mongoose.model('Technician', technicianSchema);

//express settings
module.exports = Technician;