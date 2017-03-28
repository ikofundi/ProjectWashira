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
            service: 'gmail',
            auth: {
                user: 'ikofundi1@gmail.com',
                pass: 'june2013'
            }
        }));
        var mailOptions = {
            to: 'ikofundiinfo@gmail.com',
            from: 'ikofundi1@gmail.com',
            subject: req.body.subject,
            text: req.body.message + "\n\n" + "Phone number: " + req.body.phoneNumber + "email: " + req.body.email

        };
        transporter.sendMail(mailOptions, function(err) {
            if (err)
                console.log("not sent: " + err);
            else
               res.redirect('/contactussuccess');
        });
    })
router.route('/contactussuccess')
    .get(function(req, res) {
        res.render('contactussuccess');
    })


module.exports = router;
