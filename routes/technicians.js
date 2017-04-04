var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var Technician = require('../models/technician');
var TechnicianApplication = require('../models/technicianApplication');
var Task = require('../models/task');
var User = require('../models/user');
var smtpTransport = require('nodemailer-smtp-transport');
var nodemailer = require('nodemailer');
var notifyTechnicianOfSuspension = require('../controllers/notifyTechnicianOfSuspension');

router.route('/technicians')
    .get(function(req, res) {
        Technician.find()
            .select('category firstName lastName email phoneNumber phoneNumber2 location idNumber rating ongoingJobs jobsCompleted')
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
        console.log(req.body);
        category = req.body.category.toLowerCase();
        firstname = req.body.firstname.toLowerCase();
        lastname = req.body.lastname.toLowerCase();
        email = req.body.email.toLowerCase();
        phoneNumber = req.body.phoneNumber.toLowerCase();
        phoneNumber2 = req.body.phoneNumber2.toLowerCase();
        idNumber = req.body.Idnumber.toLowerCase();
        location = req.body.location.toLowerCase();
        var allCategory;
        var allLocation;
        if (req.body.allCategory === "on")
            allCategory = true;
        if (req.body.allLocation === "on") {
            allLocation = true;

        }


        formData = {
            category: category,
            firstName: firstname,
            lastName: lastname,
            email: email,
            phoneNumber: phoneNumber,
            phoneNumber2: phoneNumber2,
            idNumber: idNumber,
            location: location,
            allLocation: allLocation,
            allCategory: allCategory
        }
        var technician = new Technician(formData);
        technician.save(function(err, technician) {
            if (err) {
                console.log(err);
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
router.route('/technicians/benched')
    .get(function(req, res) {
        Technician.find({ "benched": true })
            .select('category firstName lastName email phoneNumber phoneNumber2 location idNumber rating ongoingJobs jobsCompleted')
            .exec(function(err, technicians) {


                if (err) return console.log(err);



                res.render('technician/benched', {
                    "technicians": technicians,
                    'user': req.user
                });
            })
    })
router.route('/technicians/:id/benched')
    .get(function(req, res) {
        var taskId = req.params.id;
        // console.log(req.body);
        Technician.findById(taskId, function(err, technician) {
            if (err) return console.log("this is the error " + err);
            console.log(technician);
            technician.benched = false;
            technician.save(function(err, technician) {
                if (err) return console.log(err);
                notifyTechnicianOfSuspension(technician.phoneNumber, technician.rating, username, apikey, req, res);
                console.log("techy unbenched");
                res.redirect('/technicians/benched');
            })
        })
    })
router.route('/technicians/new')
    .get(function(req, res) {
        res.render('technician/new');
    });
// route for handling we are hiring link
router.route('/technicianhire')
    .get(function(req, res) {
        // create a message for a succesful application
        var message = "Application sent successfully.You will receive a call from us soon.";
        // render we are hiring page
        res.render('technician/hire');
    })
    .post(function(req, res) {
        if (req.body.mobileNumber === req.body.mobileNumber2)
            res.redirect("/technicianhirefail");
        else
            formData = {
                firstName: req.body.firstName,
                lastName: req.body.lastName,
                category: req.body.category,
                phoneNumber: req.body.mobileNumber,
                phoneNumber2: req.body.mobileNumber2,
                location: req.body.location,
                aboutMe: req.body.aboutMe
            }
        var technicianApplication = new TechnicianApplication(formData);
        technicianApplication.save(function(err, application) {
                if (err) return err;
                console.log("technician application saved successfully " + application);
            })
            // redirect to form with message
        res.redirect('/technicianhiresuccess');

    });
router.route('/technicianhiresuccess')
    .get(function(req, res) {
        // create a message for a succesful application
        var message = "Application sent successfully.You will receive a call from us soon.";
        // render we are hiring page
        res.render('technician/hire', {
            "message": message

        });
    })
router.route('/technicianhirefail')
    .get(function(req, res) {
        // create a message for a succesful application
        var messag = "First mobile number should be different from the second.";
        // render we are hiring page
        res.render('technician/hire', {
            "messag": messag
        });
    })
router.route('/technician/:id/view')
    .get(function(req, res) {
        console.log(req.params.id);
        technicianId = req.params.id;
        Technician.findById(technicianId, function(err, technician) {
            res.render('technician/view', {
                "technician": technician
            });
        })
    })

function deleteTechnician(method, req, res) {
    technicianId = req.params.id
    Technician.remove({
        _id: technicianId
    }, function(err) {
        if (err) return console.log(err);
        if (method === 'GET') {
            res.redirect('/technicians');

        } else {
            res.send("Technician was deleted");
        }

    });
};

router.route('/technician/:id/delete')
    .get(function(req, res) {
        deleteTechnician('GET', req, res);
    })
router.route('/technicians/applications')
    .get(function(req, res) {
        TechnicianApplication.find({ "picked": false })
            .select('category firstName lastName phoneNumber phoneNumber2 location aboutMe')
            .exec(function(err, technician) {
                technician = technician.reverse();
                if (err) return console.log(err);
                console.log(technician);
                res.render('technician/applications', {
                    "technicians": technician,
                    'user': req.user
                });
            })
    })
router.route('/technician/:id/applicant')
    .get(function(req, res) {
        console.log(req.params.id);
        technicianId = req.params.id;
        TechnicianApplication.findById(technicianId, function(err, technician) {
            res.render('technician/applicant', {
                "technician": technician,
                'user': req.user
            });
        })
    })
module.exports = router;
