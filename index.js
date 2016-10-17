var express = require('express');
var cons = require('consolidate');
var app = express();
var path = require('path');
var cookieParser = require('cookie-parser');
var expressSession = require('express-session');
var bodyParser = require('body-parser');


// express settings
app.set('port', (process.env.PORT || 8081));
app.engine('html', cons.liquid);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'html');

// express middleware
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(cookieParser());
app.use(expressSession({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: false

}));

// include routes
var indexRoute = require('./routes/index');
app.use(indexRoute);

	






app.listen(app.get('port'), function() {
    console.log('server running on http://127.0.0.1:%s', app.get('port'));

});