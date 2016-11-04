var express = require('express')
var router = express.Router();
var passport = require('passport');
var Task = require('../models/task');
var User = require('../models/user');
var flash = require('connect-flash');
var querystring = require('querystring');
var https       = require('https');


router.route('/admin/Signup')
    .get(function(req, res) {
        res.render('admin/signup');
    })
    .post(function(req, res) {
        user = new User({
            username: req.body.username,
            email: req.body.email,
            phonenumber: req.body.phonenumber,
            isAdmin: true
        });
        password = req.body.password;

        User.register(user, password, function(err, user) {
            if (err) {
                console.log('user error', user, err.message);
                return res.render('admin/signup', {
                    'user': user, 'error': err.message
                });
            }

            passport.authenticate('local')(req, res, function(){
                res.redirect('admin/dashboard');
            });
    });
    });


router.route('/admin/login')
    .get(function(req, res){
        if(req.user) return res.redirect('admin/dashboard');
        res.render('admin/login');
    })
    .post(passport.authenticate('local', { successRedirect: '/dashboard',
                                            failureRedirect: '/admin/login',
                                            failureFlash: true }));
router.route('/logout')
    .get(function(req, res){
        req.logout();
        res.redirect('/');
    });
router.route('/dashboard')
    .get(function(req, res) {
        res.render('admin/dashboard');
    })


router.route('/accesorslist')
    .get(function(req, res) {
        User.find()
            .select('username  phoneNumber isAccesor')
            .exec(function(err, users) {


                if (err) return console.log(err);

             
                // res.json(users);
                // console.log(req.user);
                // else if (req) {}
                res.render('admin/accesorslist', {
                    "users": users, 'user': req.user});



            });
      })
    




module.exports = router;