var express = require('express');
var router = express.Router();
var querystring = require('querystring');
var https = require('https');

"use strict";


 module.exports = function notifyCustomerOfQuotedPrice(to, firstname, username, apikey, req, res,quotedPrice, jobId) {

    // Define the recipient numbers in a comma separated string
    // Numbers should be in international format as shown
    
    // And of course we want our recipients to know what we really do
    var message = "Hello " + firstname + " the price for your task, task id number: " + jobId + " is" + quotedPrice + "." + "Please deposit the amount via Mpesa to paybill number 567567. Use account number " + jobId + " and we will send a fundi soon after."

    // Build the post string from an object

    var post_data = querystring.stringify({
        'username': username,
        'to': to,
        'message': message
    });

    var post_options = {
        host: 'api.africastalking.com',
        path: '/version1/messaging',
        method: 'POST',

        rejectUnauthorized: false,
        requestCert: true,
        agent: false,

        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Content-Length': post_data.length,
            'Accept': 'application/json',
            'apikey': apikey
        }
    };

    var post_req = https.request(post_options, function(res) {
        res.setEncoding('utf8');
        res.on('data', function(chunk) {
            var jsObject = JSON.parse(chunk);
            var recipients = jsObject.SMSMessageData.Recipients;
            if (recipients.length > 0) {
                for (var i = 0; i < recipients.length; ++i) {
                    var logStr = 'number=' + recipients[i].number;
                    logStr += ';cost=' + recipients[i].cost;
                    logStr += ';status=' + recipients[i].status; // status is either "Success" or "error message"
                    console.log(logStr);
                }
            } else {
                console.log('Error while sending: ' + jsObject.SMSMessageData.Message);
            }
        });
    });

    // Add post parameters to the http request
    post_req.write(post_data);

    post_req.end();
}
