var express = require('express');
var cons = require('consolidate');
var app = express();
var path = require('path');
var cookieParser = require('cookie-parser');
var expressSession = require('express-session');
var passport = require('passport');
var ensureLoggedIn = require('connect-ensure-login').ensureLoggedIn;
var LocalStrategy = require('passport-local').Strategy;
var flash = require('connect-flash');

// express middleware
var bodyParser = require('body-parser');

// include mongoose
var mongoose = require('mongoose');
var uristring =
    process.env.MONGOLAB_URI ||
    process.env.MONGOHQ_URL ||
    'mongodb://localhost/washiradb';
mongoose.connect(uristring, function(err, res) {
    if (err) {
        console.log('Error connecting to:', uristring);
      
    }
});

mongoose.Promise = global.Promise;


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

app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
// include routes
var taskRoutes = require('./routes/tasks');
app.use(taskRoutes);
var indexRoute = require('./routes/index');
app.use(indexRoute);
var accesorsRoute = require('./routes/accesors');
app.use(accesorsRoute);
var adminsRoute = require('./routes/admins');
app.use(adminsRoute);

// passport config
var User = require('./models/user');

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

	






app.listen(app.get('port'), function() {
    console.log('server running on http://127.0.0.1:%s', app.get('port'));

});