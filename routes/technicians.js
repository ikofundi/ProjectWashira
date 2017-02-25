var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var Technician = require('../models/technician');
var User = require('../models/user');
var smtpTransport = require('nodemailer-smtp-transport');
var nodemailer = require('nodemailer');

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
        phoneNumber = req.body.phoneNumber.toLowerCase();
        phoneNumber2 = req.body.phoneNumber2.toLowerCase();
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
// route for handling we are hiring link
router.route('/technicianhire')
    .get(function(req, res) {
        // create a message for a succesful application
        var message = "Application sent successfully.You will receive a call from us soon.";
        // render we are hiring page
        res.render('technician/hire');
    })
    .post(function(req, res) {
        if(req.body.mobileNumber === req.body.mobileNumber2)
            res.redirect("/technicianhirefail");
        else
            var text ="category : " + req.body.category + "\n\n" + "mobileNumber: " +  req.body.mobileNumber + "\n\n" + "mobileNumber2: " + req.body.mobileNumber2 + "\n\n" + "location: " + req.body.location + "\n\n" + "description: " + req.body.aboutMe;
 
           
        var transporter = nodemailer.createTransport(smtpTransport({
            service: 'gmail',
            auth: {
                user: 'pnganga05@gmail.com',
                pass: 'Sebleeni05'
            }
        }));
        var mailOptions = {
            to: 'pnganga05@gmail.com',
            from: 'pnganga05@gmail.com',
            subject: 'APPLICATION FOR FUNDI JOB',
            text: text
           
        };
        transporter.sendMail(mailOptions, function(err) {
            if(err)
                console.log("not sent: " + err);
            else
           console.log(mailOptions.text);
        });


  


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

module.exports = router;
