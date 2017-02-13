var express = require('express');
var router = express.Router();
var Category = require('../models/category');



router.route('/')
    .get(function(req, res) {


        res.render('index', {
            
        });




    })
router.route('/ourservices')
	.get(function (req, res) {
		 Category.find()
            .select('name')
            .exec(function(err, categories) {


                if (err) return console.log(err);


                // res.json(categories);
                console.log(req.user);

                res.render('ourservices', {
                    "categories": categories,
                    
                });
            })
	});

module.exports = router;
