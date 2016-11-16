var express = require('express');
var router = express.Router();
var querystring = require('querystring');
var https       = require('https');

"use strict";

// // Your login credentials
// var username = 'homefixer';
// var apikey   = 'c430018837f7fa144d1c0b5ea21a21dbd8340bcc7dd0a9a23898afba9f3f6b23';



module.exports = function acknowledgeGettingTask(to, firstname, availability, username, apikey, req, res) {
    
    // Define the recipient numbers in a comma separated string
    // Numbers should be in international format as shown
    var to = to;
    var firstname = firstname;
    // And of course we want our recipients to know what we really do
    var message = "Thank you " + firstname + " for requesting Homefix services. We will send an acessor at the time you have specified " + availability;
    
    // Build the post string from an object
    
    var post_data = querystring.stringify({
        'username' : username,
        'to'       : to,
        'message'  : message
    });
    
    var post_options = {
        host   : 'api.africastalking.com',
        path   : '/version1/messaging',
        method : 'POST',
        
        rejectUnauthorized : false,
        requestCert        : true,
        agent              : false,
        
        headers: {
            'Content-Type' : 'application/x-www-form-urlencoded',
            'Content-Length': post_data.length,
            'Accept': 'application/json',
            'apikey': apikey
        }
    };
    
    var post_req = https.request(post_options, function(res) {
        res.setEncoding('utf8');
        res.on('data', function (chunk) {
            var jsObject   = JSON.parse(chunk);
            var recipients = jsObject.SMSMessageData.Recipients;
            if ( recipients.length > 0 ) {
                for (var i = 0; i < recipients.length; ++i ) {
                    var logStr  = 'number=' + recipients[i].number;
                    logStr     += ';cost='   + recipients[i].cost;
                    logStr     += ';status=' + recipients[i].status; // status is either "Success" or "error message"
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

module.exports = function notifyCustomerOfQuotedPrice(to, firstname, username, availability, apikey, req, res) {
    
    // Define the recipient numbers in a comma separated string
    // Numbers should be in international format as shown
    var to = to;
    var firstname = firstname;
    // And of course we want our recipients to know what we really do
    var message = "Thank you " + firstname + " for requesting Homefix services. We will send an acessor at the time you have specified " + availability;
    
    // Build the post string from an object
    
    var post_data = querystring.stringify({
        'username' : username,
        'to'       : to,
        'message'  : message
    });
    
    var post_options = {
        host   : 'api.africastalking.com',
        path   : '/version1/messaging',
        method : 'POST',
        
        rejectUnauthorized : false,
        requestCert        : true,
        agent              : false,
        
        headers: {
            'Content-Type' : 'application/x-www-form-urlencoded',
            'Content-Length': post_data.length,
            'Accept': 'application/json',
            'apikey': apikey
        }
    };
    
    var post_req = https.request(post_options, function(res) {
        res.setEncoding('utf8');
        res.on('data', function (chunk) {
            var jsObject   = JSON.parse(chunk);
            var recipients = jsObject.SMSMessageData.Recipients;
            if ( recipients.length > 0 ) {
                for (var i = 0; i < recipients.length; ++i ) {
                    var logStr  = 'number=' + recipients[i].number;
                    logStr     += ';cost='   + recipients[i].cost;
                    logStr     += ';status=' + recipients[i].status; // status is either "Success" or "error message"
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
