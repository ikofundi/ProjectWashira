var express = require('express')
var router = express.Router();
var mongoose = require('mongoose');
var ensureLoggedIn = require('connect-ensure-login').ensureLoggedIn;
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var Task = require('../models/task');
var User = require('../models/user');
var flash = require('express-flash');
var querystring = require('querystring');
var https = require('https');
var async = require('async');
var crypto = require('crypto');
var json2csv = require('json2csv');
var fs = require('fs');

"use strict";

router.route('/admin/sign-up')
    .get(function(req, res) {
        res.render('admin/signup');
    })
    .post(function(req, res) {
        user = new User({
            isAdmin: true,
            username: req.body.username,
            email: req.body.email,
            phonenumber: req.body.phonenumber
        });
        password = req.body.password;
        confirm = req.body.confirm;
        User.register(user, password, function(err, user) {
            if (err) {
                console.log("User error", user, err, err.message);
                return res.render('/admin/signup', {
                    'user': user,
                    'error': err.message
                });
            }

            passport.authenticate('local')(req, res, function() {
                res.redirect('/admin/dashboard');
            });

        });
    });


router.route('/admin/login')
    .get(function(req, res) {
        if (req.user) return res.redirect('/admin/dashboard');
        res.render('admin/login');
    })
    .post(passport.authenticate('local', {
        successRedirect: '/admin/dashboard',
        failureRedirect: '/admin/login',
        failureFlash: true
    }));

router.route('/logout')
    .get(function(req, res) {
        req.logout();
        res.redirect('/');
    });

router.route('/admin/dashboard')
    .get(function(req, res) {
        // res.json(req.user);
        res.render('admin/dashboard', {
            "user": req.user,
        });



    });


router.route('/Accesors')
    .get(function(req, res) {
        User.find({ "isAccesor": true })
            .select('username  phonenumber email')
            .exec(function(err, users) {


                if (err) return console.log(err);


                // res.json(users);
                // console.log(req.user);

                res.render('admin/Accesors', {
                    "users": users,
                    'user': req.user
                });



            });
    })

function deleteAccesor(method, req, res) {
    userId = req.params.id
    User.remove({
        _id: userId
    }, function(err) {
        if (err) return console.log(err);
        if (method === 'GET') {
            res.redirect('/Accesors');
            console.log("You have deleted an accesor");
        } else {
            res.send("Accesor was deleted");
        }

    });
};
router.route('/accesor/:id/delete')
    .get(function(req, res) {
        deleteAccesor('GET', req, res);
    });

// router for paod tasks
router.route('/paidtasks')
    .get(function(req, res) {
        Task.find({ "amountPaid": "300" })
            .select('category firstname lastname transactionCode amountPaid email location phoneNumber description availability quotedPrice accesorComments jobId accesed')
            .exec(function(err, tasks) {


                if (err) return console.log(err);


                // res.json(tasks);
                console.log(req.user);

                res.render('admin/paidtasks', {
                    "tasks": tasks,
                    'user': req.user
                });



            });
    })
router.route('/admin/report')
    .get(function(req, res) {
        res.render('admin/report',{
            'user': req.user
        });

    })
router.route('/csvreport')
    .post(function(req, res) {
        console.log(req.body);
        Task.find()
            .select('category firstname _id lastname transactionCode amountPaid email location phoneNumber description availability quotedPrice accesorComments jobId accesed datePicked realDatePicked status')
            .exec(function(err, tasks) {
                report = [];
                console.log(req.body.from);
                tasks.forEach(function (task) {
                    if (Number(task.datePicked) > new Date(req.body.from).getTime() && Number(task.datePicked) < (new Date(req.body.to).getTime() + 86400000) ){
                        report.push(task);
                }
            })
                console.log(report);
                var fields = [ 'firstname', 'lastname', 'location', 'phoneNumber', 'category','transactionCode', 'jobId', 'amountPaid', 'status', 'realDatePicked' ];
                var csv = json2csv({ data: report, fields: fields });
                fs.writeFile('public/reports/file.csv', csv, function(err) {
                    if (err) throw err;
                    console.log('file saved');
                    res.download('public/reports/file.csv');
                    
                });

            })
    })

module.exports = router;
