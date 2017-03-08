// This page is for all the logic concerned with the task.

var express = require('express');
var router = express.Router();
var soap = require('soap');
var Task = require('../models/task');
var Technician = require('../models/technician');
var sms = require('../controllers/sms');
var notifyCustomerOfQuotedPrice = require('../controllers/notifyCustomerOfQuotedPrice');
var notifyCustomerOfMpesaReceipt = require('../controllers/notifyCustomerOfMpesaReceipt');
var notifyTechnicianOfTask = require('../controllers/notifyTechnicianOfTask');
var notifyTechnicianOfSuccessfulJobPick = require('../controllers/notifyTechnicianOfSuccessfulJobPick');
var path = require('path');
var querystring = require('querystring');
var https = require('https');
var crypto = require('crypto');
var bodyParser = require("body-parser");
var parseString = require('xml2js').parseString;
var xmlparser = require('express-xml-bodyparser');
var smtpTransport = require('nodemailer-smtp-transport');
var nodemailer = require('nodemailer');

// Declare Africaistalking username and password 
var username = 'IKOFUNDI';
var apikey = 'c579e40343543d7348e178a4fc626f644f047dfcc2a1df563ab09e1dd58bbade';

// below is how to hash a string in sha256 and base64, the password(variable pass) was given to us by safaricom.
// uncomment if needed by safcom
// var pass = "Afric@123";
// var hash = crypto.createHash('sha256').update('pass').digest('base64')


// This route requests the form for filling client's task.It also handles the response which contains the info and stores it in the database.
// It is also where the job id for the task is created.
router.route('/taskform')
    .get(function(req, res) {

        res.render('tasks/task-form');
    })
    .post(function(req, res) {

        // create a random 6 figure digit and declare it as var job id
        var jobId = Math.floor(100000 + Math.random() * 900000).toString();
        console.log(jobId);
        // save each input in the request body to a variable 

        firstname = req.body.firstname.toLowerCase();
        lastname = req.body.lastname.toLowerCase();
        email = req.body.email.toLowerCase();
        location = req.body.location.toLowerCase();
        phoneNumber = req.body.phoneNumber;
        category = req.body.category.toLowerCase();
        availability = req.body.availability;
        description = req.body.description.toLowerCase();

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

        // console.log(formData);

        task = new Task(formData);
        task.save(function(err, task) {
            if (err) {
                error = err.errors.phoneNumber.message;
                res.render('tasks/task-form1', {
                    "error": error
                });
            } else {
                console.log('successfully saved the task');

                function notifyAccesor(task) {
                    if (!task) {
                        res.redirect('/tasks/taskform');
                    } else
                        var transporter = nodemailer.createTransport(smtpTransport({
                            service: 'gmail',
                            auth: {
                                user: 'pnganga05@gmail.com',
                                pass: 'Sebleeni05'
                            }
                        }));
                    var mailOptions = {
                        to: 'pnganga05@gmail.com',
                        from: 'pnganga05@gmail.com',
                        subject: 'New Task',
                        text: "A customer has filled a new task. The job id for the task is " + task.jobId

                    };
                    transporter.sendMail(mailOptions, function(err) {
                        if (err)
                            console.log("not sent: " + err);
                        else
                            console.log("successfully sent");
                    });

                }

                function notifyAdmin(task) {
                    if (!task) {
                        res.redirect('/tasks/taskform');
                    } else
                        var transporter = nodemailer.createTransport(smtpTransport({
                            service: 'gmail',
                            auth: {
                                user: 'pnganga05@gmail.com',
                                pass: 'Sebleeni05'
                            }
                        }));
                    var mailOptions = {
                        to: 'pnganga05@gmail.com',
                        from: 'pnganga05@gmail.com',
                        subject: 'New Task',
                        text: "A customer has filled a new task. The job id for the task is " + task.jobId

                    };
                    transporter.sendMail(mailOptions, function(err) {
                        if (err)
                            console.log("not sent: " + err);
                        else
                            console.log("successfully sent");
                    });

                }
            }
            // notifyAccesor(task);
            // notifyAdmin(task);
            // send sms acknowledging getting task
            // sms(task.phoneNumber, task.firstname, task.jobId, username, apikey, req, res);


            res.render('tasks/taskfilled', {
                "task": task
            });
        })

    });

router.route('/tasks/done')
    .get(function(req, res) {
        Task.find({ "ongoing": false })
            .select('category firstname lastname email location phoneNumber description availability quotedPrice accesorComments jobId accesed ongoing fundiThatPickedThis sentToAssesor')
            .exec(function(err, tasks) {
                if (err) return console.log(err);
                res.render('admin/completetasks', {
                    "tasks": tasks,
                    'user': req.user
                });
            });
    })

// this route returns all the unacessed tasks to the acessor
router.route('/tasks/accesor/unaccesed')
    .get(function(req, res) {
        Task.find({ "accesed": false })
            .select('category firstname lastname email location phoneNumber description availability quotedPrice accesorComments jobId accesed')
            .exec(function(err, tasks) {
                if (err) return console.log(err);
                res.render('accesor/unAccesedtasks', {
                    "tasks": tasks,
                    'user': req.user
                });
            });
    })
    // this route returns all the acessed tasks to the acessor
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
    // this route returns all the unacessed tasks to the admin
router.route('/tasks/admin/ongoing')
    .get(function(req, res) {
        Task.find({ "ongoing": true, })
            .select('category firstname lastname email location phoneNumber  description availability jobId quotedPrice accesorComments amountPaid')
            .exec(function(err, tasks) {
                if (err) return console.log(err);
                res.render('admin/ongoingtasks', {
                    "tasks": tasks,
                    'user': req.user
                });
            });
    })

// route for searching and returning a task by job id
router.route('/tasks/search')

.post(function(req, res) {
    console.log(req.body.q);
    Task.find({ "jobId": req.body.q })
        .select('category firstname lastname amountPaid email location phoneNumber description availability quotedPrice accesorComments jobId accesed')
        .exec(function(err, tasks) {
            if (err) return console.log(err);
            res.render('admin/searchresult', {
                "tasks": tasks
            });
        });
})

// this route returns all the tasks that have been sent to fundis
router.route('/tasks/admin/senttofundi')
    .get(function(req, res) {
        Task.find({ "sentToFundi": true, "ongoing": true })
            .select('category firstname lastname amountPaid email location phoneNumber description availability quotedPrice accesorComments jobId accesed')
            .exec(function(err, tasks) {


                if (err) return console.log(err);


                // res.json(tasks);
                console.log(req.user);

                res.render('admin/senttofundi', {
                    "tasks": tasks,
                    'user': req.user
                });



            });
    })
    // this route returns all the tasks sent to accesor and not fundi
router.route('/tasks/admin/senttoassesor')
    .get(function(req, res) {
        Task.find({ "sentToAssesor": true, "ongoing": true })
            .select('category firstname lastname amountPaid email location phoneNumber description availability quotedPrice accesorComments jobId accesed')
            .exec(function(err, tasks) {


                if (err) return console.log(err);

                res.render('admin/senttoassesor', {
                    "tasks": tasks,
                    'user': req.user
                });



            });
    })
router.route('/tasks/admin/pickedbyfundi')
    .get(function(req, res) {
        Task.find({ "pickedByFundi": true, "ongoing": true })
            .select('category firstname lastname amountPaid email location phoneNumber description availability quotedPrice accesorComments jobId accesed pickedByFundi fundiThatPickedThis')
            .exec(function(err, tasks) {


                if (err) return console.log(err);

                res.render('admin/pickedbyfundi', {
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
                // send sms notifying customer of the quoted price
                // notifyCustomerOfQuotedPrice(task.phoneNumber, task.firstname, username, apikey, req, res, task.quotedPrice, task.jobId);
                res.redirect('/tasks/accesor/accesed');

            };

        });
    });
};



router.route('/tasks/:id/edit')
    .get(function(req, res) {

        taskId = req.params.id;

        // retrieve the task from mongodb
        Task.findById(taskId, function(err, task) {
            if (err) return console.log(err);


            res.render('accesor/editTask', {
                "task": task
            });

        });

    })
    .post(function(req, res) {
        updateTask('POST', req, res);

    });

router.route('/tasks/:id/adminviewtask')
    .get(function(req, res) {

        taskId = req.params.id;

        // retrieve the task from mongodb
        Task.findById(taskId, function(err, task) {
            if (err) return console.log(err);


            res.render('tasks/taskdetail', {
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

router.route('/tasks/:id/mpesa/confirmc2bpayment')
    .get(function(req, res) {
        taskId = req.params.id;

        // retrieve the task from mongodb
        Task.findById(taskId, function(err, task) {
            if (err) return console.log(err);



            res.render('tasks/mpesadetails', {
                "task": task
            });

        });

    })
    .post(function(req, res) {
        // name the details as incoming
        idOfThisTask = req.params.id;
        var incoming = req.body;
        console.log(incoming);

        function sendToAssesor(req, res, incoming) {
            if (incoming.sendTo === "assesor") {
                Task.findOneAndUpdate({ "jobId": incoming.jobId, "phoneNumber": incoming.phoneNumber }, { $set: { amountPaid: incoming.amountPaid, sentToAssesor: true, sentToFundi: false } }, { new: true }, function(err, task) {
                    if (err) return console.log(err);
                    console.log("sent to assesor");
                    res.redirect('/tasks/admin/sentToAssesor');
                })
            } else
                sendToFundi(req, res, incoming);
        }

        function sendToFundi(req, res, incoming) {
            if (incoming.sendTo === "fundi") {
                // Find the task using the phone number returned by safcom and set the amount paid
                Task.findOneAndUpdate({ "jobId": incoming.jobId, "phoneNumber": incoming.phoneNumber }, { $set: { amountPaid: incoming.amountPaid, sentToFundi: true, sentToAssesor: false } }, { new: true }, function(err, task) {
                    if (err) return console.log(err);
                    // send sms to customer acknowledging receipt of mpesa payment
                    // notifyCustomerOfMpesaReceipt(incoming.phoneNumber, incoming.amountPaid, username, apikey, req, res);

                    taskCategory = task.category.toLowerCase();
                    tasklocation = task.location.toLowerCase();
                    // find technician by category of the task returned by safcom
                    Technician.find({ "category": taskCategory || "all"})
                        .select('category firstname lastname email  phoneNumber location')
                        .exec(function(err, technician) {


                            if (err) return console.log(err);
                            // create an empty array technicianPhoneNumbers to store phone numbers of the technicians found
                            var technicianPhoneNumbers = [];
                            // loop through the array returned by the query
                            for (var i = 0; i < technician.length; i++) {
                                // push each technician's number to the technicianPhoneNumbers array
                                technicianPhoneNumbers.push(technician[i]["phoneNumber"]);
                                if (technicianPhoneNumbers.length > 3)
                                // reshuffle the array randomly
                                // truncate the array to 3
                                    technicianPhoneNumbers.length = 3;
                                // change the array to a comma separated string for use with africaistalking apikey

                                var technicianPhoneNumbersAsString = technicianPhoneNumbers.join();
                            }
                            // send message of task availabililty to technicians on that task's category
                            // notifyTechnicianOfTask(technicianPhoneNumbersAsString, task.jobId, username, apikey, req, res);

                            // redirect to paid tasks
                            console.log("sent to fundi");
                            res.redirect('/tasks/admin/senttofundi')
                        });
                })
            } else
                sendToAssesor(req, res, incoming);
        }
        sendToAssesor(req, res, incoming);
    });
// This is a route with the logic of how fundis pick a task
// to receive the fundis answer see this https://account.africastalking.com/sms/inboxcallback
router.route('/tasks/receivesms')
    .post(function(req, res) {

        var fromPhoneNumber = req.body.from;
        var text = req.body.text;
        // var text = 'Fundi yesy 136264';
        // console.log(req.body);
        var taskId = text.substring(10, 17).toLowerCase().trim();
        console.log(taskId.length);
        text = text.substring(6, 10).toLowerCase().trim();
        console.log(text);
        console.log(taskId);

        if (text === "yes " && taskId.length === 6) {
            Task.find({ "jobId": taskId })
                .select('category firstname lastname amountPaid email location phoneNumber description availability quotedPrice accesorComments jobId ongoing sentToFundi sentToAssesor pickedByFundi')
                .exec(function(err, tasks) {
                    if (err) return console.log(err);
                    var task = tasks[0];
                    if (task.pickedByFundi === false) {
                        task.pickedByFundi = true;
                        task.fundiThatPickedThis = fromPhoneNumber;

                        task.save(function(err, task) {
                            if (err) return console.log(err);

                            console.log(task);
                            // send sms to fundi giving him customer phonenumber
                            notifyTechnicianOfSuccessfulJobPick(fromPhoneNumber, taskId, task.phoneNumber, username, apikey, req, res);
                        })
                    } else if (tasks[0].pickedByFundi === true) {
                        console.log("job already picked");
                        res.end();
                    }
                })
        } else if (text === "done" && taskId.length === 6) {
            Task.find({ "jobId": taskId, "phoneNumber": fromPhoneNumber })
                .select('category firstname lastname amountPaid email location phoneNumber description availability quotedPrice accesorComments jobId ongoing sentToFundi sentToAssesor pickedByFundi')
                .exec(function(err, tasks) {
                    if (err) return console.log(err);

                    var task = tasks[0];
                    if (task.ongoing === true) {

                        task.ongoing = false;

                        task.save(function(err, task) {
                            if (err) return console.log(err);

                            console.log(task);
                            // send sms to fundi giving him customer phonenumber
                        })
                    }
                })
        } else {
            res.end();
        }
    })





module.exports = router;
