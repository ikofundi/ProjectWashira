var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var passport = require('passport');
var User = require('../models/user');
var flash = require('connect-flash');
var LocalStrategy = require('passport-local').Strategy;
var ensureLoggedIn = require('connect-ensure-login').ensureLoggedIn;
var smtpTransport = require('nodemailer-smtp-transport');
var nodemailer = require('nodemailer');
var async = require('async');
var crypto = require('crypto');
"use strict";

router.route('/accesor/signup')
    .get(function(req, res) {
        res.render('accesor/signup');
    })
    .post(function(req, res) {
        user = new User({
            username: req.body.username,
            email: req.body.email,
            phonenumber: req.body.phonenumber,
            isAccesor: true
        });
        password = req.body.password;
        confirm = req.body.confirm;
        User.register(user, password, function(err, user) {
            if (err) {
                console.log("User error", user, err, err.message);
                return res.render('/accesor/signup', {
                    'user': user,
                    'error': err.message
                });
            }

            passport.authenticate('local')(req, res, function() {
                res.redirect('/admin/dashboard');
            });

        });
    });


router.route('/accesor/login')
    .get(function(req, res) {

        if (req.user) return res.redirect('/tasks/accesor/unaccesed');
        res.render('accesor/login');
    })
    .post(passport.authenticate('local', {
        successRedirect: '/tasks/accesor/unaccesed',
        failureRedirect: '/accesor/login',
        failureFlash: true
    }));


router.route('/accesor/forgot')
    .get(function(req, res) {
        res.render('accesor/forgot', {
            user: req.user
        });
    })
    .post(function(req, res, next) {
        async.waterfall([
            function(done) {
                crypto.randomBytes(20, function(err, buf) {
                    var token = buf.toString('hex');
                    done(err, token);
                });
            },
            function(token, done) {
                User.findOne({ email: req.body.email }, function(err, user) {
                    if (!user) {
                        req.flash('error', 'No account with that email address exists.');
                        return res.redirect('/accesor/forgot');
                    }

                    user.resetPasswordToken = token;
                    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour

                    user.save(function(err) {
                        done(err, token, user);
                    });
                });
            },
            function(token, user, done) {
                var transporter = nodemailer.createTransport(smtpTransport({
                    service: 'gmail',
                    auth: {
                        user: 'pnganga05@gmail.com',
                        pass: 'sebleeni05'
                    }
                }));
                var mailOptions = {
                    to: user.email,
                    from: 'pnganga05@gmail.com',
                    subject: 'Node.js Password Reset',
                    text: 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
                        'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
                        'http://' + req.headers.host + '/accesor/reset/' + token + '\n\n' +
                        'If you did not request this, please ignore this email and your password will remain unchanged.\n'
                };
                transporter.sendMail(mailOptions, function(err) {
                    req.flash('info', 'An e-mail has been sent to ' + user.email + ' with further instructions.');
                    done(err, 'done');
                });
            }
        ], function(err) {
            if (err) return next(err);
            res.redirect('/accesor/login');
        });
    });

router.route('/accesor/reset/:token')
    .get(function(req, res) {
        User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } },
            function(err, user) {
                if (!user) {
                    req.flash('error', 'Password reset token is invalid or has expired.');
                    return res.redirect('/accesor/forgot');
                }
                res.render('accesor/reset', {
                    user: req.user
                });
            });
    })
    .post(function(req, res) {
        async.waterfall([
            function(done) {
                User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } },
                    function(err, user) {
                        if (!user) {
                            req.flash('error', 'Password reset token is invalid or has expired.');
                            return res.redirect('back');
                        }

                        password = req.body.password;
                        user.resetPasswordToken = undefined;
                        user.resetPasswordExpires = undefined;

                        user.save(password, function(err) {
                            req.logIn(user, function(err) {
                                done(err, user);
                            });
                        });
                    });
            },
            function(user, done) {
                var transporter = nodemailer.createTransport(smtpTransport({
                    service: 'gmail',
                    auth: {
                        user: 'pnganga05@gmail.com',
                        pass: 'sebleeni05'
                    }
                }));
                var mailOptions = {
                    to: user.email,
                    from: 'pnganga05@gmail.com',
                    subject: 'Your password has been changed',
                    text: 'Hello,\n\n' +
                        'This is a confirmation that the password for your account ' + user.email + ' has just been changed.\n'
                };
                transporter.sendMail(mailOptions, function(err) {
                    req.flash('success', 'Success! Your password has been changed.');
                    done(err);
                });
            }
        ], function(err) {
            res.redirect('/accesor/login');
        });
    });



router.route('/logout')
    .get(function(req, res) {
        req.logout();
        res.redirect('/');
    });

module.exports = router;
