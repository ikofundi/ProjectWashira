// This page is for all the logic concerned with the task.

var express = require('express');
var router = express.Router();
var soap = require('soap');
var Task = require('../models/task');
var Technician = require('../models/technician');
var sms = require('../controllers/sms');
var notifyCustomerOfMpesaReceipt = require('../controllers/notifyCustomerOfMpesaReceipt');
var path = require('path');
var querystring = require('querystring');
var https = require('https');
var crypto = require('crypto');
var bodyParser = require("body-parser");
var parseString = require('xml2js').parseString;
xmlparser = require('express-xml-bodyparser');
// Declare Africaistalking username and password 
var username = 'homefixer';
var apikey = 'c430018837f7fa144d1c0b5ea21a21dbd8340bcc7dd0a9a23898afba9f3f6b23';

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
                res.redirect('/tasks/accesor/accesed');

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

// router.route('/tasks/mpesa/registerUrl')
//     .all(function(req, res) {
//             // var pass = "Afric@123";
//             // var hash = crypto.createHash('sha256').update(pass).digest('base64');

//             var wsdlUrl = 'CBPInterface_Request1.wsdl';
//             var soapHeader = {
//                 spId: "107015",
//                 spPassword: hash,
//                 timeStamp: Date.now(),
//                 serviceId: "107015000"
//             };
//             var msg = {
//                 Transaction: {
//                     CommandID: "RegisterURL",
//                     OriginatorConversationID: "Reg-266-1126",
//                     Parameters: {
//                         Parameter: {
//                             Key: "ResponseType",
//                             Value: "Completed",
//                         }
//                     },
//                     ReferenceData: {
//                         ReferenceItem: {
//                             Key: "ValidationURL",
//                             Value: "https://projectwashira.herokuapp.com/tasks/mpesa/validatec2bpayment"
//                         },
//                         ReferenceItem: {
//                             Key: "ConfirmationURL",
//                             Value: "https://projectwashira.herokuapp.com/tasks/mpesa/confirmc2bpayment"
//                         }
//                     },
//                 },
//                 Identity: {
//                     Caller: {
//                         CallerType: "0",
//                         ThirdpartyID: "",
//                         password: "",
//                         CheckSum: "",
//                         ResultURL: ""
//                     },
//                     Initiator: {
//                         PrimaryParty: {
//                             IdentifierType: "1",
//                             Identifier: "",
//                             ShortCode: "777135"
//                         }


//                     }
//                 },
//                 KeyOwner: "1"
//             };
//             soap.createClient(wsdlUrl, function(err, soapClient) {
//                 // we now have a soapClient - we also need to make sure there's no `err` here. 
//                 if (err) {
//                     return res.status(500).json(err);
//                 }
//                 soapClient.RequestSOAPHeader(soapHeader, function(err, result) {
//                     if (err) {
//                         return res.status(500).json(err);
//                     }
//                     return res.json(result);
//                 });
//                 soapClient(wsdlUrl, function(err, soapClient) {
//                     // we now have a soapClient - we also need to make sure there's no `err` here. 
//                     if (err) {
//                         return res.status(500).json(err);
//                     }
//                     soapClient.RequestMsg(msg, function(err, result) {
//                         if (err) {
//                             return res.status(500).json(err);
//                         }
//                         return res.json(result);
//                     });

//                 });


//             });
//         });

router.route('/tasks/mpesa/validatec2bpayment')
    .post(xmlparser({ trim: false, explicitArray: false }), function(req, res) {
        // the req object contains transaction details from safcom
        req.setEncoding('utf8');
        // name the details incoming
        var incoming = req.body;
        // stringify the Json request
        var request = JSON.stringify(incoming);
        console.log(incoming);

        // change the request to a javascript object
        var reqObject = JSON.parse(request);
        // set response content type to xml
        res.set('Content-Type', 'text/xml');
        // extract the transaction details from object and save each separately as a string
        var transAmount = reqObject["soapenv:envelope"]["soapenv:body"][0]["c2b:c2bpaymentvalidationrequest"][0]["transamount"][0];
        var msisdn = reqObject["soapenv:envelope"]["soapenv:body"][0]["c2b:c2bpaymentvalidationrequest"][0]["msisdn"][0];
        var mpesaFirstName = reqObject["soapenv:envelope"]["soapenv:body"][0]["c2b:c2bpaymentvalidationrequest"][0]["kycinfo"][0]["kycname"][0];

        // console.log(transAmount);
        // res.send(msisdn);

        res.send('<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:c2b="http://cps.huawei.com/cpsinterface/c2bpayment"><soapenv:Header/><c2b:C2BPaymentValidationResult><ResultCode>0</ResultCode><ResultDesc>Service processing successful</ResultDesc><ThirdPartyTransID>1234560000088888</ThirdPartyTransID></c2b:C2BPaymentValidationResult></soapenv:Body></soapenv:Envelope>');

        // res.redirect('/tasks/mpesa/validatec2bpayment');
    });

router.route('/tasks/mpesa/confirmc2bpayment')
    .post(xmlparser({ trim: false, explicitArray: false }), function(req, res) {
        // the req object contains transaction details from safcom
        req.setEncoding('utf8');
        // name the details incoming
        var incoming = req.body;
        // console.log(incoming);
        // stringify the Json request
        var request = JSON.stringify(incoming);
        // change the request to a javascript object
        var reqObject = JSON.parse(request);

        // extract the transaction details from object and save each separately as a string
        var transAmount = reqObject["soapenv:envelope"]["soapenv:body"][0]["c2b:c2bpaymentvalidationrequest"][0]["transamount"][0];
        var msisdn = reqObject["soapenv:envelope"]["soapenv:body"][0]["c2b:c2bpaymentvalidationrequest"][0]["msisdn"][0];
        var mpesaFirstName = reqObject["soapenv:envelope"]["soapenv:body"][0]["c2b:c2bpaymentvalidationrequest"][0]["kycinfo"][0]["kycname"][0];
        // concatenate the returned phone number that lacks + sign with a + sign
        msisdn = "+".concat(msisdn);
        // Find the task using the phone number returned by safcom and set the amount paid
        Task.findOneAndUpdate({ "phoneNumber": msisdn }, { $set: { amountPaid: transAmount } }, { new: true }, function(err, task) {


                    if (err) return console.log(err);
                    // send sms to customer acknowledging receipt of mpesa payment
                    // notifyCustomerOfMpesaReceipt(msisdn, transAmount, username, apikey, req, res);
                    console.log(task.category);
                    taskCategory = task.category.toLowerCase();
                    // find technician by category of the task returned by safcom
                    Technician.find({ "category": taskCategory })
                        .select('category firstname lastname email  phoneNumber ')
                        .exec(function(err, technician) {


                            if (err) return console.log(err);

                            console.log(technician[0]);
                            res.json(technician);
                        });







                }

            )
            // set response content type to xml
        res.set('Content-Type', 'text/xml');
        // send response to safcom
        // res.send('<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:c2b="http://cps.huawei.com/cpsinterface/c2bpayment"><soapenv:Header/><soapenv:Body> <c2b:C2BPaymentConfirmationResult>C2B Payment Transaction 1234560000007031 result received.</c2b:C2BPaymentConfirmationResult></soapenv:Body></soapenv:Envelope>');

    });

module.exports = router;
