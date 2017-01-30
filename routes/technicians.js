var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var Technician = require('../models/technician');
var User = require('../models/user');

router.route('/technicians')
    .get(function(req, res) {
        Technician.find()
            .select('category firstName lastName email phoneNumber idNumber')
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
            category = req.body.category.toLowerCase(),
            firstname = req.body.firstname.toLowerCase(),
            lastname = req.body.lastname.toLowerCase(),
            email = req.body.email.toLowerCase(),
            phoneNumber =  req.body.phoneNumber.toLowerCase(),
            idNumber = req.body.Idnumber.toLowerCase()
        formData = {
            category: category,
            firstName: firstname,
            lastName: lastname,
            email: email,
            phoneNumber: phoneNumber,
            idNumber: idNumber


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
