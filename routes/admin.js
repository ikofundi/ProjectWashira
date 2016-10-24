var express = require('express');
var router = express.Router();
var passport = require('passport');
var Admin = require('../models/admin');


router.route('/admin-sign-up')
    .get(function(req, res) {
        res.render('admin/sign-up');
    })
//     .post(function(req, res) {
//         user = new User({
//             username: req.body.username,
//             email: req.body.email,
           
//         });
//         password = req.body.password;

//         User.register(user, password, function(err, user) {
//             if (err) {
//                 console.log('user error', user, err.message);
//                 return res.render('users/sign-up', {
//                     'user': user, 'error': err.message
//                 });
//             }

//             passport.authenticate('local')(req, res, function(){
//             	res.redirect('/movies');
//             });
//     });
//     });

// router.route('/login')
// 	.get(function(req, res){
// 		if(req.user) return res.redirect('/');
// 		res.render('users/login');
// 	})
// 	.post(passport.authenticate('local', {
// 		successRedirect: '/',
// 		failureRedirect: '/login'
// 	}))
// router.route('/logout')
// 	.get(function(req, res){
// 		req.logout();
// 		res.redirect('/');
// 	});

module.exports = router;
