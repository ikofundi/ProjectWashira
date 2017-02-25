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
        // send sms acknowledging getting task
        // sms(formData.phoneNumber, formData.firstname, formData.availability, username, apikey, req, res);
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
            notifyAccesor(task); res.redirect('/');
        })

    });




// this route returns all the unacessed tasks to the acessor
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
router.route('/tasks/admin/unaccesed')
    .get(function(req, res) {
        Task.find({ "accesed": false })
            .select('category firstname lastname email location phoneNumber  description availability jobId quotedPrice accesorComments')
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
    // this route returns all the acessed tasks to the admin
router.route('/tasks/admin/accesed')
    .get(function(req, res) {
        Task.find({ "accesed": true })
            .select('category firstname lastname amountPaid email location phoneNumber description availability quotedPrice accesorComments jobId accesed')
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
    254
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


// router.route('/tasks/:id')
//     .get(function(req, res) {
//         taskId = req.params.id;

//         // retrieve the task from mongodb
//         Task.findById(taskId, function(err, task) {
//             if (err) return console.log(err);

//             // res.json(task.accesed);
//             console.log(req.user);

//             res.render('accesor/editTask', {
//                 "task": task,
//                 'user': req.user
//             });


//         });
//     });
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


// router.route('/tasks/mpesa/validatec2bpayment')
//     .post(xmlparser({ trim: false, explicitArray: false }), function(req, res) {
//         // the req object contains transaction details from safcom
//         req.setEncoding('utf8');
//         // name the details incoming
//         var incoming = req.body;
//         // stringify the Json request
//         var request = JSON.stringify(incoming);
//         console.log(incoming);

//         // change the request to a javascript object
//         var reqObject = JSON.parse(request);
//         // set response header content type to xml
//         res.set('Content-Type', 'text/xml');
//         // extract the transaction details from object and save each separately as a string
//         var transAmount = reqObject["soapenv:envelope"]["soapenv:body"][0]["c2b:c2bpaymentvalidationrequest"][0]["transamount"][0];
//         var msisdn = reqObject["soapenv:envelope"]["soapenv:body"][0]["c2b:c2bpaymentvalidationrequest"][0]["msisdn"][0];
//         var mpesaFirstName = reqObject["soapenv:envelope"]["soapenv:body"][0]["c2b:c2bpaymentvalidationrequest"][0]["kycinfo"][0]["kycname"][0];
//         msisdn = "+".concat(msisdn);
//         // find task using the req body phone number
//         Task.find({ "phoneNumber": msisdn })
//             .select('category firstname lastname amountPaid email location phoneNumber description availability quotedPrice accesorComments jobId accesed')
//             .exec(function(err, tasks) {


//                 if (err) return console.log(err);
//                 console.log(tasks.length);
//                 if (tasks.length != 0) {
//                     res.send('<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:c2b="http://cps.huawei.com/cpsinterface/c2bpayment"><soapenv:Header/><c2b:C2BPaymentValidationResult><ResultCode>0</ResultCode><ResultDesc>Service processing successful</ResultDesc><ThirdPartyTransID>1234560000088888</ThirdPartyTransID></c2b:C2BPaymentValidationResult></soapenv:Body></soapenv:Envelope>');
//                 } else {
//                     res.send('<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:c2b="http://cps.huawei.com/cpsinterface/c2bpayment"><soapenv:Header/><c2b:C2BPaymentValidationResult><ResultCode>1</ResultCode><ResultDesc>Service processing unsuccessful</ResultDesc><ThirdPartyTransID>1234560000088888</ThirdPartyTransID></c2b:C2BPaymentValidationResult></soapenv:Body></soapenv:Envelope>');
//                 }

//             });

//     });

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


        // Find the task using the phone number returned by safcom and set the amount paid
        Task.findOneAndUpdate({ "jobId": incoming.jobId, "phoneNumber": incoming.phoneNumber }, { $set: { amountPaid: incoming.amountPaid } }, { new: true }, function(err, task) {


                if (err) return console.log(err);
                // send sms to customer acknowledging receipt of mpesa payment
                // notifyCustomerOfMpesaReceipt(incoming.phoneNumber, incoming.amountPaid, username, apikey, req, res);
                console.log(task.category);
                taskCategory = task.category.toLowerCase();
                tasklocation = task.location.toLowerCase();
                // find technician by category of the task returned by safcom
                Technician.find({ "category": taskCategory, "location": tasklocation })
                    .select('category firstname lastname email  phoneNumber location')
                    .exec(function(err, technician) {


                        if (err) return console.log(err);
                        // create an empty array technicianPhoneNumbers to store phone numbers of the technicians found
                        var technicianPhoneNumbers = [];
                        // loop through the array returned by the query
                        for (var i = 0; i < technician.length; i++) {
                            // push each technician's number to the technicianPhoneNumbers array
                            technicianPhoneNumbers.push(technician[i]["phoneNumber"]);
                            // change the array to a comma separated string for use with africaistalking apikey

                            var technicianPhoneNumbersAsString = technicianPhoneNumbers.join();
                        }
                        // send message of task availabililty to technicians on that task's category
                        // notifyTechnicianOfTask(technicianPhoneNumbersAsString, task.quotedPrice, username, apikey, req, res);

                        // redirect to paid tasks
                        res.send(technicianPhoneNumbersAsString);
                        // res.send('<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:c2b="http://cps.huawei.com/cpsinterface/c2bpayment"><soapenv:Header/><soapenv:Body> <c2b:C2BPaymentConfirmationResult>C2B Payment Transaction 1234560000007031 result received.</c2b:C2BPaymentConfirmationResult></soapenv:Body></soapenv:Envelope>');
                    });







            }

        )


    });

module.exports = router;
