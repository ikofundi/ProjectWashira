var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var Technician = require('../models/technician');
var User = require('../models/user');

router.route('/technicians')
    .get(function(req, res) {
        Technician.find()
            .select('category firstname lastname email phoneNumber Idnumber')
            .exec(function(err, technicians) {


                if (err) return console.log(err);


                // res.json(technicians);
                
                res.render('technician/index', {
                    "technicians": technicians, 'user': req.user
                });



            });
    })
    .post(function(req, res) {
        console.log(req.body);
        formData = req.body;
        var technician = new Technician(formData);
        technician.save(function(err, technician) {
            if (err) {
                console.log(err);
            } else {
                console.log('successfully saved the technician');
                res.redirect('/technicians');
            }

        });
});

router.route('/technicians/new')
    .get(function(req, res) {
        res.render('technician/new');
    });


module.exports = router;
