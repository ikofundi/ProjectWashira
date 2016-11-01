var express = require('express')
var router = express.Router();
var passport = require('passport');
var Accesor = require('../models/accesor');



router.route('/accesorsignup')
    .get(function(req, res) {
        res.render('accesor/signup');
    })
    .post(function(req, res) {
        accesor = new Accesor({
            username: req.body.username,
            email: req.body.email,
         
        });
        password = req.body.password;

        Accesor.register(accesor, password, function(err, accesor) {
            if (err) {
                console.log('accesor error', accesor, err.message);
                return res.render('accesor/signup', {
                    'accesor': accesor, 'error': err.message
                });
            }

            passport.authenticate('local')(req, res, function(){
                res.redirect('/accesor');
            });
    });
    });

router.route('/accesorlogin')
    .get(function(req, res){
        if(req.accesor) return res.redirect('/accesor');
        res.render('accesor/login');
    })
    .post(passport.authenticate('local', {
        successRedirect: '/accesor',
        failureRedirect: '/accesorlogin'
    }))
router.route('/logout')
    .get(function(req, res){
        req.logout();
        res.redirect('/');
    });

module.exports = router;
