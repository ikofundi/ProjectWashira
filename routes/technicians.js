var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var Technician = require('../models/technician');
var User = require('../models/user');

router.route('/technicians')
    .get(function(req, res) {
        Technician.find()
            .select('category firstName lastName email phoneNumber phoneNumber2 location idNumber')
            .exec(function(err, technicians) {


                if (err) return console.log(err);


                // res.json(technicians);

                res.render('technician/index', {
                    "technicians": technicians,
                    'user': req.user
                });



            });
    })
    .post(function(req, res) {
        console.log(req.body.category);
            category = req.body.category.toLowerCase();
            firstname = req.body.firstname.toLowerCase();
            lastname = req.body.lastname.toLowerCase();
            email = req.body.email.toLowerCase();
            phoneNumber =  req.body.phoneNumber.toLowerCase();
            phoneNumber2 =  req.body.phoneNumber2.toLowerCase();
            idNumber = req.body.Idnumber.toLowerCase();
            location = req.body.location.toLowerCase();

        formData = {
            category: category,
            firstName: firstname,
            lastName: lastname,
            email: email,
            phoneNumber: phoneNumber,
            phoneNumber2: phoneNumber2,
            idNumber: idNumber,
            location: location
        }
        var technician = new Technician(formData);
        technician.save(function(err, technician) {
            if (err) {
                console.log(err["errors"]["phoneNumber"]["message"]);
                error = err["errors"]["phoneNumber"]["message"];
                res.render('technician/new', {
                'error': error
            });
            } else {
                console.log(technician);
                console.log('successfully saved the technician');
                res.redirect('/technicians');
            }

        });
    });

router.route('/technicians/new')
    .get(function(req, res) {
        res.render('technician/new');
    });
router.route('/technicianhire')
    .get(function (req, res) {
        res.render('technician/hire');
    })


module.exports = router;
