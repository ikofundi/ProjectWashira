var mongoose = require('mongoose');
// define schema
var technicianSchema = mongoose.Schema({
    category: String,
    firstName: String,
    lastName: String,
    email: String,
    location: String,
    phoneNumber: {type: String, minlength: 13, maxlength: 13},
    phoneNumber2: {type: String, minlength: 13, maxlength: 13},
    idNumber: {type: String, minlength: 8, maxlength: 8},
    allCategory: { type: Boolean, default: false },
    allLocation: { type: Boolean, default: false },
    benched: { type: Boolean, default: false },
    jobsPicked: {type: Number, default: 0},
    ongoingJobs: {type: Number, default: 0},
    timeJobPicked: {type: Number, default: 0},
    jobsCompleted: {type: Number, default: 0},
    customerRating: {type: Number, default: 0},
    rating: {type: Number, default: 0 }

    
});

// compile model

var Technician = mongoose.model('Technician', technicianSchema);

//express settings
module.exports = Technician;