var express = require('express');
var router = express.Router();
var Category = require('../models/category');
var smtpTransport = require('nodemailer-smtp-transport');
var nodemailer = require('nodemailer');



router.route('/')
    .get(function(req, res) {


        res.render('index', {

        });




    })
router.route('/ourservices')
    .get(function(req, res) {
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
router.route('/aboutus')
    .get(function(req, res) {
        res.render('aboutus');
    })
router.route('/staffportal')
    .get(function(req, res) {
        res.render('staffportal');
    })
router.route('/contactus')
    .get(function(req, res) {
        res.render('contactus');
    })
    .post(function(req, res) {
        console.log(req.body);
        var transporter = nodemailer.createTransport(smtpTransport({
            host: 'smtp.zoho.com',
            port: 465,
            secure: true, // use SSL
            auth: {
                user: 'internal@ikofundi.com',
                pass: 'june2013'
            }
        }));
        var mailOptions = {
            to: 'wilfred@ikofundi.com',
            from: 'internal@ikofundi.com',
            subject: req.body.subject,
            text: req.body.message + "\n\n" + "Phone number: " + req.body.phoneNumber + "email: " + req.body.email

        };
        transporter.sendMail(mailOptions, function(err) {
            if (err)
                console.log("not sent: " + err);
            else

            function emailAdmin(email) {
                var transporter = nodemailer.createTransport(smtpTransport({
                    host: 'smtp.zoho.com',
                    port: 465,
                    secure: true, // use SSL
                    auth: {
                        user: 'internal@ikofundi.com',
                        pass: 'june2013'
                    }
                }));
                var mailOptions = {
                    to: 'admin@ikofundi.com',
                    from: 'internal@ikofundi.com',
                    subject: 'Message Received',
                    text: req.body.message + "\n\n" + "Phone number: " + req.body.phoneNumber + "email: " + req.body.email

                };
                transporter.sendMail(mailOptions, function(err) {
                    if (err)
                        console.log("not sent: " + err);
                    else

                        res.redirect('/contactussuccess');
                });
            }

            function respondWithEmail(email) {
                var transporter = nodemailer.createTransport(smtpTransport({
                    host: 'smtp.zoho.com',
                    port: 465,
                    secure: true, // use SSL
                    auth: {
                        user: 'internal@ikofundi.com',
                        pass: 'june2013'
                    }
                }));
                var mailOptions = {
                    to: email,
                    from: 'internal@ikofundi.com',
                    subject: 'Message Received',
                    text: "Thank you for contacting Iko Fundi. Your message has been received and we are attending to it. You can also give us a call at +254790 517 775"

                };
                transporter.sendMail(mailOptions, function(err) {
                    if (err)
                        console.log("not sent: " + err);
                    else

                        res.redirect('/contactussuccess');
                });
            }
            emailAdmin(req.body.email);
            respondWithEmail(req.body.email);
        });
    })
router.route('/contactussuccess')
    .get(function(req, res) {
        res.render('contactussuccess');
    })


module.exports = router;
