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
        // createjobIdList = function () {
        //     var jobIdList = [];
        //    Task.find()
        //     .select('jobId')
        //     .exec(function(err, tasks) {


        //         if (err) return console.log(err);
        //         // id = JSON.stringify(tasks)
        //         console.log(tasks);
        //         for (var i = 0; i < tasks.length; i++) {

        //             jobIdList[i] = tasks[i];
        //             }
                
        //       var tasks = tasks;

        //             return tasks
        //     });
             
        // }

        jobIdList = [];
         
        idCreator = function(idList) {
                // let jobId = "345456";
                // let idList = idList;
                var jobId = Math.floor(100000 + Math.random() * 900000).toString();
                // if (idList === []) { console.log("empty"); }
                var checkId = function(jobId, idList) {


                    for (var i = 0; i < idList.length; i++) {
                        if (jobId === idList[i]) {
                            // console.log("inafanana");
                            jobId = Math.floor(100000 + Math.random() * 900000).toString();
                            checkId(jobId, idList);
                            return jobId
                        } else {
                            // console.log("sawa");
                            return jobId
                        }
                    }
                }

                return checkId(jobId, idList);
            }
            // jobIdList[0];
        jobId = idCreator(jobIdList);

       jobIdList.push(jobId);
        console.log(jobId);
        
        console.log(jobIdList);
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
            jobId: jobId
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

router.route('/tasks/accesor/unaccesed')
    .get(function(req, res) {
        Task.find({ "accesed": false })
            .select('category firstname lastname email location phoneNumber description availability quotedPrice accesorComments jobId accesed')
            .exec(function(err, tasks) {


                if (err) return console.log(err);


                // res.json(tasks);
                console.log(req.user);

                res.render('accesor/unAccesedtasks', {
                    "tasks": tasks,
                    'user': req.user
                });



            });
    })
router.route('/tasks/accesor/accesed')
    .get(function(req, res) {
        Task.find({ "accesed": true })
            .select('category firstname lastname email location phoneNumber description availability quotedPrice accesorComments jobId accesed')
            .exec(function(err, tasks) {


                if (err) return console.log(err);


                // res.json(tasks);
                console.log(req.user);

                res.render('accesor/accesedtasks', {
                    "tasks": tasks,
                    'user': req.user
                });



            });
    })
router.route('/tasks/admin/unaccesed')
    .get(function(req, res) {
        Task.find({ "accesed": false })
            .select('category firstname lastname email location phoneNumber description availability jobId quotedPrice accesorComments')
            .exec(function(err, tasks) {


                if (err) return console.log(err);


                // res.json(tasks);
                console.log(req.user);

                res.render('admin/unAccesedtasks', {
                    "tasks": tasks,
                    'user': req.user
                });



            });
    })
router.route('/tasks/admin/accesed')
    .get(function(req, res) {
        Task.find({ "accesed": true })
            .select('category firstname lastname email location phoneNumber description availability quotedPrice accesorComments jobId accesed')
            .exec(function(err, tasks) {


                if (err) return console.log(err);


                // res.json(tasks);
                console.log(req.user);

                res.render('admin/accesedtasks', {
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
        if (err) return console.log("this is the error " + err);

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
        task.accesed = true;
        task.save(function(err, task) {
            if (err) return console.log(err);


            if (method === 'PUT') {
                res.json(task);

            } else {

                res.send('/tasks/accesor/accesed');
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

            // res.json(task.accesed);
            console.log(req.user);

            res.render('accesor/editTask', {
                "task": task,
                'user': req.user
            });


        });
    });
router.route('/tasks/:id/edit')
    .get(function(req, res) {

        taskId = req.params.id;

        // retrieve the task from mongodb
        Task.findById(taskId, function(err, task) {
            if (err) return console.log(err);

            // res.json(movie);
            res.render('tasks/editTask', {
                "task": task
            });

        });

    })
    .post(function(req, res) {
        updateTask('POST', req, res);

    });

function deleteTask(method, req, res) {
    taskId = req.params.id
    Task.remove({
        _id: taskId
    }, function(err) {
        if (err) return console.log(err);
        if (method === 'GET') {
            res.redirect('/tasks/admin');
            console.log("You have deleted a task");
        } else {
            res.send("Task was deleted");
        }

    });
};
router.route('/tasks/:id/delete')
    .get(function(req, res) {
        deleteTask('GET', req, res);
    });

module.exports = router;
