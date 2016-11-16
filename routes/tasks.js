var express = require('express');
var router = express.Router();
var Task = require('../models/task');
var sms = require('../controllers/sms');
// var jobId = require('../controllers/jobId');
var querystring = require('querystring');
var https = require('https');
// Your login credentials
var username = 'homefixer';
var apikey = 'c430018837f7fa144d1c0b5ea21a21dbd8340bcc7dd0a9a23898afba9f3f6b23';

router.route('/taskform')
    .get(function(req, res) {



        res.render('tasks/task-form');
    })
    .post(function(req, res) {
        console.log(req.body);

        // create job id
       var  jobId = Math.floor(100000 + Math.random() * 900000).toString();
       console.log(jobId);
         firstname = req.body.firstname;
         lastname = req.body.lastname;
         email = req.body.email;
         location = req.body.location;
         phoneNumber = req.body.phoneNumber;
         category = req.body.category;
         availability = req.body.availability;
         description = req.body.description;

        formData = {
            firstname: firstname,
            lastname: lastname,
            email: email,
            location: location,
            phoneNumber: phoneNumber,
            category: category,
            availability: availability,
            description: description,
            jobId : jobId
        }
   
   console.log(formData);
     //send sms acknowledging getting task
     // sms(formData.phoneNumber, formData.firstname, formData.availability, username, apikey, req, res);
       task = new Task(formData);
        task.save(function(err, task) {
            if (err) {
                console.log(err);
            } else {
                console.log('successfully saved the task');

                function notifyAccesor(task) {
                    console.log('notified Accesor of ' + task)
                }
                notifyAccesor(task);
                res.redirect('/done');
            }

        });
    });


router.route('/done')
    .get(function(req, res) {



        res.render('tasks/done');
    });

router.route('/tasks/accesor')
    .get(function(req, res) {
        Task.find()
            .select('category firstname lastname email location phoneNumber description availability quotedPrice accesorComments jobId')
            .exec(function(err, tasks) {


                if (err) return console.log(err);


                // res.json(tasks);
                console.log(req.user);

                res.render('accesor/tasks', {
                    "tasks": tasks,
                    'user': req.user
                });



            });
    })
router.route('/tasks/admin')
    .get(function(req, res) {
        Task.find()
            .select('category firstname lastname email location phoneNumber description availability quotedPrice accesorComments')
            .exec(function(err, tasks) {


                if (err) return console.log(err);


                // res.json(tasks);
                console.log(req.user);
                // else if (req) {}
                res.render('admin/tasks', {
                    "tasks": tasks,
                    'user': req.user
                });



            });
    })

function updateTask(method, req, res) {
    taskId = req.params.id;
    accesorCategory = req.body.category;
    accesorFirstName = req.body.firstname;
    accesorLastName = req.body.lastname;
    accesorEmail = req.body.email;
    accesorLocation = req.body.location;
    accesorPhoneNumber = req.body.phoneNumber;
    accesorDescription = req.body.description;
    accesorAvailability = req.body.availability;
    accesorQuotedPrice = req.body.quotedPrice;
    accesorComments = req.body.accesorComments;

    // retrieve the task from Mongodb
    Task.findById(taskId, function(err, task) {
        if (err) return console.log(err);

        task.category = accesorCategory;
        task.firstname = accesorFirstName;
        task.lastname = accesorLastName;
        task.email = accesorEmail;
        task.location = accesorLocation;
        task.phoneNumber = accesorPhoneNumber;
        task.description = accesorDescription;
        task.availability = accesorAvailability;
        task.quotedPrice = accesorQuotedPrice;
        task.accesorComments = accesorComments;

        task.save(function(err, task) {
            if (err) return console.log(err);


            if (method === 'PUT') {
                res.json(task);

            } else {
                res.redirect('/notifyCustomer');
                // res.json(task);
            };

        });
    });
};


router.route('/tasks/:id')
    .get(function(req, res) {
        taskId = req.params.id;

        // retrieve the task from mongodb
        Task.findById(taskId, function(err, task) {
            if (err) return console.log(err);

            // res.json(task);
            console.log(req.user);
            res.render('tasks/taskdetail', {
                "task": task,
                'user': req.user
            });


        });
    })
    .post(function(req, res) {
        updateTask('POST', req, res);


    });

module.exports = router;
