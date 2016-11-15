var express = require('express')
var router = express.Router();
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy; 
var Task = require('../models/task');
var User = require('../models/user');
var flash = require('express-flash');
var querystring = require('querystring');
var https = require('https');

"use strict";

router.route('/admin/Signup')
    .get(function(req, res) {
        res.render('admin/signup');
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
            res.render('accesor/signup', {
                'errors': errors[0].msg
            });
        } else {
            var newUser = new User({
                phonenumber: phonenumber,
                email: email,
                username: username,
                password: password,
                isAdmin: true
            });

            User.createUser(newUser, function(err, user) {
                if (err) throw err;
                console.log(user);
            });

            req.flash('success_msg', 'You are registered and can now login');

            res.redirect('/admin/login');
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


router.route('/admin/login')
    .get(function(req, res) {
        if (req.user) return res.redirect('/tasks/admin');
        res.render('admin/login');
    })
    .post(passport.authenticate('local', {
        successRedirect: '/tasks/admin',
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

        res.render('admin/dashboard', {
            "user": req.user,
        });



    });


router.route('/accesorslist')
    .get(function(req, res) {
        User.find()
            .select('username  phoneNumber')
            .exec(function(err, users) {


                if (err) return console.log(err);


                // res.json(users);
                // console.log(req.user);
                // else if (req) {}
                res.render('admin/accesorslist', {
                    "users": users,
                    'user': req.user
                });



            });
    })





module.exports = router;
