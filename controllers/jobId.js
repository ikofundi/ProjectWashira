"use strict";
var express = require('express');
var router = express.Router();
var Task = require('../models/task');

exports.module = function generateJobId(req, res) {
    Task.find()
        .select('jobId')
        .exec(function(err, tasks) {


            if (err) return console.log(err);


           console.log(tasks);




        });
}
