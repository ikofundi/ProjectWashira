var express = require('express')
var router = express.Router();



router.route('/done')
    .get(function(req, res) {

         
                
                res.render('tasks/done');       
    });


module.exports = router;