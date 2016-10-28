var express = require('express')
var router = express.Router();
var Task = require('../models/task');


router.route('/accesor')
    .get(function(req, res) {
        Task.find()
            .select('category firstname lastname email location phoneNumber description availability')
            .exec(function(err, tasks) {


                if (err) return console.log(err);


                // res.json(tasks);
                
                res.render('accesor/home', {
                    "tasks": tasks});



            });
      })

router.route('/tasks/:id')
    .get(function(req, res) {
        taskId = req.params.id;

        // retrieve the movie from mongodb
        Task.findById(taskId, function(err, task) {
            if (err) return console.log(err);

            // res.json(task);
            res.render('tasks/taskdetail', {
                "task": task
            });


        });
    })
module.exports = router;