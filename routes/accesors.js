var express = require('express')
var router = express.Router();
var passport = require('passport');
var User = require('../models/user');
var flash = require('connect-flash');
var ensureLoggedIn = require('connect-ensure-login').ensureLoggedIn;


router.route('/accesor/Signup')
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

        User.register(user, password, function(err, user) {
            if (err) {
                console.log('user error', user, err.message);
                return res.render('accesor/signup', {
                    'user': user, 'error': err.message
                });
            }

            passport.authenticate('local')(req, res, function(){
                res.redirect('/accesor');
            });
    });
    });

router.route('/accesor/login')
    .get(function(req, res){
       
        if(req.user) return res.redirect('/tasks/accesor');
        res.render('accesor/login');
    })
    .post(passport.authenticate('local', { successRedirect: '/tasks/accesor',
                                            failureRedirect: '/accesor/login',
                                            failureFlash: true }));


 
router.route('/logout')
    .get(function(req, res){
        req.logout();
        res.redirect('/');
    });

module.exports = router;
 