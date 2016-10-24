// define schema
var mongoose = require('mongoose');
var categorySchema = mongoose.Schema({
    name: String,
    
});

// compile model

var Category = mongoose.model('Category', categorySchema);
//express settings
module.exports = Category;