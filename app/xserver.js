'use strict';

var express = require('express'),
    http = require('http'),
    passport = require('passport'),
    path = require('path'),
    fs = require('fs'),
    passport = require('passport'),
    LocalStrategy = require('passport-local').Strategy;
    //LocalStrategy = require('passport-local').Strategy;
var app = express();
//Logic to connect to database
var passport = require('passport'),
    LocalStrategy = require('passport-local').Strategy,
    Sequelize = require('sequelize'), 
    sequelize = new Sequelize('maxwallet', 'postgres', 'Compost12!', {
      dialect: "postgres", // or 'sqlite', 'postgres', 'mariadb'
      port:    5432, // or 5432 (for postgres)
    })
//Connects to postgres database
sequelize
  .authenticate()
  .complete(function(err) {
    if (!!err) {
      console.log('Unable to connect to the database:', err)
    } else {
      console.log('Connection has been established successfully.')
    }
  })
//Defines Model for login
var User = sequelize.define('User', {
  email: Sequelize.STRING,
  password: Sequelize.STRING
})
//Adds some dummy data the table
sequelize.sync({ force: true }).complete(function(err) {
  User.create({ email: 'john@google.com', password: '1111' }).complete(function(err, user1) {
    User.find({ email: 'john'}).complete(function(err, user2) {
    //Do some testing here?
    })
  })
})
// Serialize sessions
passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.find({ _id: id }).complete(function(err, user) {
    done(err, user);
  });
});
//Defies valid login
passport.use(new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password'
  },
  function(email, password, done) {
    User.find({ email: email }).complete(function (err, user) {
      if (err) {
        return done(err);
      }
      if (email !== user.email) {
        return done(null, false, {
          'errors': {
            'email': { type: 'Email is not registered.' }
          }
        });
      }
      if (user.password !== password) {
        return done(null, false, {
          'errors': {
            'password': { type: 'Password is incorrect.' }
          }
        });
      }
      return done(null, user);
    });
  }
));

// Define a middleware function to be used for every secured routes
var auth = function(req, res, next){
  if (!req.isAuthenticated()) 
    res.send(401);
  else
    next();
};
//==================================================================

// all environments
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.cookieParser()); 
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(express.session({ secret: 'securedsession' }));
app.use(passport.initialize()); // Add passport initialization
app.use(passport.session());    // Add passport initialization
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}
/**
 * Session
 * returns info on authenticated user
 */
var session = function session (req, res) {
  res.json(req.user);
};

var ensureAuthenticated = function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) { return next(); }
  res.send(401);
}
/**
 * Logout
 * returns nothing
 */
var logout = function logout (req, res) {
  if(req.user) {
    console.log("Logging out?");
    req.logout();
    res.send(200);
  } else {
    console.log("Not logged in");
    res.send(400, "Not logged in");
  }
};
/**
 *  Login
 *  requires: {email, password}
 */
var login = function (req, res, next) {
  passport.authenticate('local', function(err, user, info) {
    var error = err || info;
    if (error) { return res.json(400, error); }
    req.logIn(user, function(err) {
      if (err) { return res.send(err); }
      res.json(req.user.user_info);
    });
  })(req, res, next);
}
// route to log in
app.post('/auth/session', login);
app.get('/auth/session', ensureAuthenticated, session);
app.del('/auth/session', logout);

/* serves main page */
app.get("/", function(req, res) {
  res.sendfile('index.html')
});

app.post("/user/add", function(req, res) { 
/* some server side logic */
res.send("OK");
});

/* serves all the static files */
app.get(/^(.+)$/, function(req, res){ 
   //console.log('static file request : ' + req.params);
   res.sendfile( __dirname + req.params[0]); 
});

var port = process.env.PORT || 5000;
app.listen(port, function() {
 console.log("Listening on " + port);
});




