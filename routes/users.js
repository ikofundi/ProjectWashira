var express = require('express')
var router = express.Router();
var passport = require('passport');
var User = require('../models/user');
var flash = require('connect-flash');


router.route('/signup')
    .get(function(req, res) {
        res.render('accesor/signup');
    })
    .post(function(req, res) {
        user = new User({
            username: req.body.username,
            email: req.body.email,
            phonenumber: req.body.phonenumber,
         
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

router.route('/login')
    .get(function(req, res){
        if(req.user) return res.redirect('/accesor');
        res.render('accesor/login');
    })
    .post(passport.authenticate('local', { successRedirect: '/accesor',
                                            failureRedirect: '/login',
                                            failureFlash: true }));
    
router.route('/logout')
    .get(function(req, res){
        req.logout();
        res.redirect('/');
    });

module.exports = router;
 