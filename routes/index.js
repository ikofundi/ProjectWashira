var express = require('express');
var router = express.Router();
var Category = require('../models/category');

router.route('/')
	  .get(function(req, res) {
        Category.find()
            .select('name')
            .exec(function(err, categories) {


                if (err) return console.log(err);


                // res.json(categories);
                
                res.render('index', {
                    "categories": categories});



            });
      })



module.exports = router;