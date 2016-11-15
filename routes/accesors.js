var express = require('express')
var router = express.Router();
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

router.route('/accesor/Signup')
    .get(function(req, res) {
        res.render('accesor/signup');
    })
    .post(function(req, res) {
        var phonenumber = req.body.phonenumber;
        var email = req.body.email;
        var username = req.body.username;
        var password = req.body.password;
        var confirm = req.body.confirm;

        // Form validation

        req.checkBody('phonenumber', 'phonenumber is required').notEmpty();
        req.checkBody('email', 'Email is required').notEmpty();
        req.checkBody('email', 'Email is not valid').isEmail();
        req.checkBody('username', 'Username is required').notEmpty();
        req.checkBody('password', 'Password is required').notEmpty();
        req.checkBody('confirm', 'Passwords do not match').equals(req.body.password);
        var errors = req.validationErrors();
        
        if (errors) {
            console.log(errors[0].msg);
            res.render('accesor/signup', {
                'errors': errors[0].msg
            });
        } else {
            var newUser = new User({
                phonenumber: phonenumber,
                email: email,
                username: username,
                password: password,
                isAccesor: true
            });

            User.createUser(newUser, function(err, user) {
                if (err) throw err;
                console.log(user);
            });

            req.flash('success_msg', 'You are registered and can now login');

            res.redirect('/accesor/login');
        }

    });

// authenticate login using passport
passport.use(new LocalStrategy(
    function(username, password, done) {
        User.getUserByUsername(username, function(err, user) {
            if (err) throw err;
            if (!user) {
                return done(null, false, { message: 'Unknown User' });
            }

            User.comparePassword(password, user.password, function(err, isMatch) {
                if (err) throw err;
                if (isMatch) {
                    return done(null, user);
                } else {
                    return done(null, false, { message: 'Invalid password' });
                }
            });
        });
    }));

passport.serializeUser(function(user, done) {
    done(null, user.id);
});

passport.deserializeUser(function(id, done) {
    User.getUserById(id, function(err, user) {
        done(err, user);
    });
});

router.route('/accesor/login')
    .get(function(req, res) {

        if (req.user) return res.redirect('/tasks/accesor');
        res.render('accesor/login');
    })
    .post(passport.authenticate('local', {
        successRedirect: '/tasks/accesor',
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
