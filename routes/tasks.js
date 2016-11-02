var express = require('express')
var router = express.Router();
var Task = require('../models/task');
var querystring = require('querystring');
var https       = require('https');

router.route('/taskform')
    .get(function(req, res) {

    	 
                
                res.render('tasks/task-form');       
    })
    .post(function (req, res) {
    	console.log(req.body);
    	formData = req.body;

// Your login credentials
var username = 'homefixer';
var apikey   = 'c430018837f7fa144d1c0b5ea21a21dbd8340bcc7dd0a9a23898afba9f3f6b23';

// function sendMessage() {
    
//     // Define the recipient numbers in a comma separated string
//     // Numbers should be in international format as shown
//     var to      = formData.phoneNumber;
    
//     // And of course we want our recipients to know what we really do
//     var message = "Thank you " + formData.firstname + " for requesting Homefix services. We will send an acessor at the time you have specified " + req.body.availability;
    
//     // Build the post string from an object
    
//     var post_data = querystring.stringify({
//         'username' : username,
//         'to'       : to,
//         'message'  : message
//     });
    
//     var post_options = {
//         host   : 'api.africastalking.com',
//         path   : '/version1/messaging',
//         method : 'POST',
        
//         rejectUnauthorized : false,
//         requestCert        : true,
//         agent              : false,
        
//         headers: {
//             'Content-Type' : 'application/x-www-form-urlencoded',
//             'Content-Length': post_data.length,
//             'Accept': 'application/json',
//             'apikey': apikey
//         }
//     };
    
//     var post_req = https.request(post_options, function(res) {
//         res.setEncoding('utf8');
//         res.on('data', function (chunk) {
//             var jsObject   = JSON.parse(chunk);
//             var recipients = jsObject.SMSMessageData.Recipients;
//             if ( recipients.length > 0 ) {
//                 for (var i = 0; i < recipients.length; ++i ) {
//                     var logStr  = 'number=' + recipients[i].number;
//                     logStr     += ';cost='   + recipients[i].cost;
//                     logStr     += ';status=' + recipients[i].status; // status is either "Success" or "error message"
//                     console.log(logStr);
//                     }
//                 } else {
//                     console.log('Error while sending: ' + jsObject.SMSMessageData.Message);
//             }
//         });
//     });
    
//     // Add post parameters to the http request
//     post_req.write(post_data);
    
//     post_req.end();
// }

// //Call sendMessage method
// sendMessage();
        var task = new Task(formData);
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

router.route('/accesor')
    .get(function(req, res) {
        Task.find()
            .select('category firstname lastname email location phoneNumber description availability quotedPrice accesorComments')
            .exec(function(err, tasks) {


                if (err) return console.log(err);


                // res.json(tasks);
                console.log(req.user);
                
                res.render('accesor/tasks', {
                    "tasks": tasks, 'user': req.user});



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

        // retrieve the movie from mongodb
        Task.findById(taskId, function(err, task) {
            if (err) return console.log(err);

            // res.json(task);
             console.log(req.user);
            res.render('tasks/taskdetail', {
                "task": task, 'user': req.user
            });


        });
    })
    .post(function(req, res) {
        updateTask('POST', req, res);
    

    });

module.exports = router;