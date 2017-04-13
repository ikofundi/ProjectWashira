var express = require('express');
var router = express.Router();
var Task = require('../models/task');
var Technician = require('../models/technician');
var path = require('path');
var notifyTechnicianOfSuspension = require('../controllers/notifyTechnicianOfSuspension');
var notifyCustomerOfJobCompletion = require('../controllers/notifyCustomerOfJobCompletion');
var smtpTransport = require('nodemailer-smtp-transport');
var nodemailer = require('nodemailer');
var username = 'IKOFUNDI';
var apikey = 'c579e40343543d7348e178a4fc626f644f047dfcc2a1df563ab09e1dd58bbade';
module.exports = function done(jobIdSent, from, fundiRating, res, req) {
    // if fundi has been rated more than 5, make the rataing to be 5 
    if (fundiRating > 5)
        fundiRating = 5;
    console.log(fundiRating);
    // if fundi has been rated less than 3 end task & bench him
    if (fundiRating <= 3) {
        console.log("this fundi has to be benched");
        Task.find({ "jobId": jobIdSent, "phoneNumber": from })
            .select('category firstname lastname amountPaid email location phoneNumber description availability quotedPrice accesorComments jobId ongoing sentToFundi sentToAssesor pickedByFundi fundiThatPickedTaskNumber fundiThatPickedTaskName ')
            .exec(function(err, tasks) {
                // make sure the returned task is good
                if (err) return console.log(err);
                var task = tasks[0];
                if (task === undefined) {
                    console.log("not customer");
                    res.end();
                } else {
                    if (task.ongoing === true) {
                        task.save(function(err, task) {
                            if (err) return console.log(err);
                            // query for the techy who picked the job
                            Technician.find({ "phoneNumber": task.fundiThatPickedTaskNumber })
                                .select('category firstName lastName email phoneNumber phoneNumber2 location idNumber ongoingJobs timeJobPicked jobsPicked jobsCompleted customerRating rating benched')
                                .exec(function(err, technician) {
                                    if (err) return console.log(err);
                                    console.log(technician[0].rating);
                                    technician[0].ongoingJobs--;
                                    technician[0].jobsPicked--;
                                    technician[0].jobsCompleted++;
                                    technician[0].customerRating += fundiRating;
                                    technician[0].rating = Number((technician[0].customerRating / technician[0].jobsCompleted).toFixed(1));
                                    technician[0].benched = true;
                                    if (technician[0].rating > 5)
                                        technician[0].rating = 5;
                                    console.log(technician[0].rating);
                                    technician[0].save(function(err, tec) {
                                        console.log(tec.rating);
                                        // send sms to  customer telling them task is closed
                                        notifyTechnicianOfSuspension(tec.phoneNumber, tec.customerRating, username, apikey, req, res);

                                        notifyCustomerOfJobCompletion(task.phoneNumber, task.jobId, username, apikey, req, res);
                                    })
                                })
                                // send email to admin informing him of complete task
                            function notifyAdminOfTaskCompletion(task) {
                                var transporter = nodemailer.createTransport(smtpTransport({
                                    host: 'smtp.zoho.com',
                                    port: 465,
                                    secure: true, // use SSL
                                    auth: {
                                        user: 'internal@ikofundi.com',
                                        pass: 'june2013'
                                    }
                                }));
                                var mailOptions = {
                                    to: 'ikofundiinfo@gmail.com',
                                    from: 'internal@ikofundi.com',
                                    subject: 'New Task',
                                    text: "Job No: " + task.jobId + " has been completed and the customer is satisfied"
                                };
                                transporter.sendMail(mailOptions, function(err) {
                                    if (err)
                                        console.log("not sent: " + err);
                                    else
                                        console.log("successfully sent");
                                });
                            }
                            notifyAdminOfTaskCompletion(task);
                        })
                        task.status = "done";
                        task.ongoing = false;
                        res.end();
                    } else {
                        res.end();
                    }
                }
            })
            //if rating id okay, end task and rate fundi
    } else
        Task.find({ $and: [{ "jobId": jobIdSent, "phoneNumber": from }, { $or: [{ "sentToAssesor": true }, { "pickedByFundi": true }] }] })
        .select('category firstname lastname amountPaid email location phoneNumber description availability quotedPrice accesorComments jobId ongoing sentToFundi sentToAssesor pickedByFundi fundiThatPickedTaskNumber fundiThatPickedTaskName ')
        .exec(function(err, tasks) {
            if (err) return console.log(err);
            var task = tasks[0];
            if (task === undefined) {
                console.log("not customer");
                res.end();
            } else {
                if (task.ongoing === true) {

                    task.save(function(err, task) {
                        if (err) return console.log(err);
                        Technician.find({ "phoneNumber": task.fundiThatPickedTaskNumber })
                            .select('category firstName lastName email phoneNumber phoneNumber2 location idNumber ongoingJobs timeJobPicked jobsPicked jobsCompleted customerRating rating benched')
                            .exec(function(err, technician) {
                                if (err) return console.log(err);
                                if (technician[0] === undefined) {
                                    console.log("not customer");
                                    res.end();
                                } else {
                                    console.log(technician[0].rating);
                                    technician[0].ongoingJobs--;
                                    technician[0].jobsPicked--;
                                    technician[0].jobsCompleted++;
                                    technician[0].customerRating += fundiRating;
                                    technician[0].rating = Number((technician[0].customerRating / technician[0].jobsCompleted).toFixed(1));
                                    if (technician[0].rating > 5)
                                        technician[0].rating = 5;
                                    console.log(technician[0].rating);
                                    technician[0].save(function(err, tec) {
                                        console.log(tec.rating);
                                        if (tec.rating <= 3) {
                                            tec.benched = true;
                                            tec.save(function(err, tec) {
                                                console.log("tec benched " + tec.benched);
                                                // send sms to  customer telling them task is closed
                                                notifyTechnicianOfSuspension(tec.phoneNumber, tec.rating, username, apikey, req, res);
                                                notifyCustomerOfJobCompletion(task.phoneNumber, task.jobId, username, apikey, req, res);
                                            })
                                        } else {
                                            // send sms to  customer telling them task is closed
                                            notifyCustomerOfJobCompletion(task.phoneNumber, task.jobId, username, apikey, req, res);
                                        }

                                    })


                                }
                            })
                            // send email to admin informing him of complete task
                        function notifyAdminOfTaskCompletion(task) {
                            var transporter = nodemailer.createTransport(smtpTransport({
                                 host: 'smtp.zoho.com',
                                    port: 465,
                                    secure: true, // use SSL
                                    auth: {
                                        user: 'internal@ikofundi.com',
                                        pass: 'june2013'
                                    }
                            }));
                            var mailOptions = {
                                to: 'ikofundiinfo@gmail.com',
                                from: 'internal@ikofundi.com',
                                subject: 'New Task',
                                text: "Job No: " + task.jobId + " has been completed and the customer is satisfied"
                            };
                            transporter.sendMail(mailOptions, function(err) {
                                if (err)
                                    console.log("not sent: " + err);
                                else
                                    console.log("successfully sent");
                            });
                        }
                        notifyAdminOfTaskCompletion(task);
                    })
                    task.status = "done";
                    task.ongoing = false;
                    res.end();
                } else {
                    res.end();
                }
            }
        })
}
