var express = require('express');
var router = express.Router();
var Task = require('../models/task');
var Technician = require('../models/technician');
var path = require('path');
var notifyTechnicianOfSuccessfulJobPick = require('../controllers/notifyTechnicianOfSuccessfulJobPick');
var smtpTransport = require('nodemailer-smtp-transport');
var nodemailer = require('nodemailer');
var username = 'IKOFUNDI';
var apikey = 'c579e40343543d7348e178a4fc626f644f047dfcc2a1df563ab09e1dd58bbade';
module.exports = function pick(jobIdSent, from, res, req) {
    var task;
    var technician;
    var from = from;
    var jobIdSent = jobIdSent;
    var receivedTask;
    Task.find({$and:[{ "jobId": jobIdSent}, {"sentToFundi": true}]})
        .select('category firstname lastname amountPaid email location phoneNumber description availability quotedPrice accesorComments jobId ongoing sentToFundi sentToAssesor pickedByFundi fundiThatPickedTaskNumber fundiThatPickedTaskName ')
        .exec(function(err, tasks) {
            if (tasks[0] === undefined) {
                console.log("not identified");
                res.end();
            } else if (tasks[0].pickedByFundi) {
                console.log('already picked');
                res.end();
            } else {

                Technician.find({$and:[{ "phoneNumber": from },{ "benched": false }]})
                    .select('category firstName lastName email phoneNumber phoneNumber2 location idNumber ongoingJobs timeJobPicked jobsPicked jobsCompleted rating benched')
                    .exec(function(err, technicians) {
                        technician = technicians[0];
                        if (technician === undefined) {
                            console.log("not identified");
                            res.end();
                        }else{
                        	 console.log(technician.jobsPicked);

                        if (technician.jobsPicked >= 3) {
                            console.log("more");
                            res.end();
                        } else if (technician.jobsPicked < 3) {
                            technician.jobsPicked++;
                            technician.ongoingJobs++;
                            technician.timeJobPicked = new Date().getTime();
                            technician.save(function(err, techy) {
                                if (err) return console.log(err);
                                console.log(techy);
                                Task.find({ "jobId": jobIdSent })
                                    .select('category firstname lastname amountPaid email location phoneNumber description availability quotedPrice accesorComments jobId ongoing sentToFundi sentToAssesor pickedByFundi fundiThatPickedTaskNumber fundiThatPickedTaskName ')
                                    .exec(function(err, tasks) {
                                        task = tasks[0];
                                        task.status = "pickedByFundi";
                                        task.pickedByFundi = true;
                                        task.fundiThatPickedTaskNumber = from;
                                        task.fundiThatPickedTaskName = techy.firstName + " " + techy.lastName;
                                        task.jobAlreadyPicked = true;
                                        task.save(function(err, tasky) {
                                            if (err) return console.log(err);
                                            console.log(tasky);

                                            function notifyAdminJobPickedByFundi(task) {
                                                var transporter = nodemailer.createTransport(smtpTransport({
                                                    service: 'gmail',
                                                    auth: {
                                                        user: 'ikofundi1@gmail.com',
                                                        pass: 'june2013'
                                                    }
                                                }));
                                                var mailOptions = {
                                                    to: 'ikofundiinfo@gmail.com',
                                                    from: 'ikofundi1@gmail.com',
                                                    subject: 'New Task',
                                                    text: "Job NO: " + task.jobId + " in " + task.location + " category, " + task.category + " has been picked by " + task.fundiThatPickedTaskName + " " + task.fundiThatPickedTaskNumber
                                                };
                                                transporter.sendMail(mailOptions, function(err) {
                                                    if (err)
                                                        console.log("not sent: " + err);
                                                    else
                                                        console.log("successfully sent");
                                                });
                                            }
                                            notifyTechnicianOfSuccessfulJobPick(from, jobIdSent, tasky.phoneNumber, tasky.location, tasky.availability, techy.rating, username, apikey, req, res);
                                            notifyAdminJobPickedByFundi(tasky);
                                            res.end();
                                        })
                                        console.log(task);
                                    })

                            })
                        }
                        }
                       
                    })

            }
        })
}
