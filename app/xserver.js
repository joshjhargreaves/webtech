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
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var favicon = require('serve-favicon');
var logger = require('morgan');
var methodOverride = require('method-override');
var session = require('express-session');
var errorhandler = require('errorhandler');
//Logic to connect to database
var passport = require('passport'),
    LocalStrategy = require('passport-local').Strategy,
    Sequelize = require('sequelize');
var sequelize;
if(process.env.DATABASE_URL) {
  console.log("DATABASE_URL set");
  var match = process.env.DATABASE_URL.match(/postgres:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+)/)
  sequelize = new Sequelize(match[5], match[1], match[2], {
    dialect:  'postgres',
    protocol: 'postgres',
    port:     match[4],
    host:     match[3],
    logging:  true //false
  })
} else {
  sequelize = new Sequelize('fullstack', 'postgres', 'compost12', {
    dialect: "postgres", // or 'sqlite', 'postgres', 'mariadb'
    port:    5432, // or 5432 (for postgres)
  })
}
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
  email: {
    type: Sequelize.STRING,
    validate: {
      isEmail: true
    }
  },
  password: Sequelize.STRING
})
var AddressBookEntries = sequelize.define('AddressBookEntries', {
  name: Sequelize.STRING,
  address: Sequelize.STRING,
  notes: Sequelize.STRING
});
User.hasMany(AddressBookEntries);

var Tickets = sequelize.define('Tickets', {
  email: Sequelize.STRING,
  summary: Sequelize.TEXT,
  notes: Sequelize.TEXT
});

User.hasMany(Tickets);
//Adds some dummy data the table
sequelize.sync({ force: true}).complete(function(err) {
  User.create({ email: 'john@google.com', password: '1111' }).complete(function(err, user1) {
    User.find({where: { email: 'john'}}).complete(function(err, user2) {
    //Do some testing here?
    })
  })
  User.create({ email: 'admin@google.com', password: '1234' }).complete(function(err, user1) {
    User.find({where: { email: 'admin@google.com'}}).complete(function(err, user2) {
    //Do some testing here?
    })
  })
  Tickets.create({ UserId: '1', email: 'john@google.com', summary: 'Woooo Skiing', notes: 'When are we going to finish this coursework' }).complete(function(err, ticket) {
    //console.log(ticket);
  })
  Tickets.create({ UserId: '1', email: 'john@google.com', summary: 'My hand got stuck in a blender', notes: 'How am I supposed to code now?' }).complete(function(err, ticket) {
    //console.log(ticket);
  })
  Tickets.create({ UserId: '2', email: 'admin@google.com', summary: 'Woooo Skiing', notes: 'When are we going to finish this coursework' }).complete(function(err, ticket) {
    //console.log(ticket);
  })
  Tickets.create({ UserId: '2', email: 'admin@google.com', summary: 'My hand got stuck in a blender', notes: 'How am I supposed to code now?' }).complete(function(err, ticket) {
    //console.log(ticket);
  })
  Tickets.create({ UserId: '1', email: 'john@google.com', summary: 'I forgot how to JavaScript', notes: 'Am I not a l33t coder?' }).complete(function(err, ticket) {
    //console.log(ticket);
  })
  Tickets.create({ UserId: '2', email: 'admin@google.com', summary: 'I forgot how to JavaScript', notes: 'Am I not a l33t coder?' }).complete(function(err, ticket) {
    //console.log(ticket);
  })
})
// Serialize sessions
passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.find({where: {id: id }}).complete(function(err, user) {
    done(err, user);
  });
});
//Defies valid login
passport.use(new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password'
  },
  function(email, password, done) {
    User.find({where: { email: email }}).complete(function (err, user) {
      if (err) {
        return done(err);
      }
      if (!user) {
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
app.use(logger('dev'));
app.use(cookieParser()); 
app.use(bodyParser());
app.use(methodOverride());
app.use(session({ secret: 'securedsession' }));
app.use(passport.initialize()); // Add passport initialization
app.use(passport.session());    // Add passport initialization
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(errorhandler());
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

var userCreate = function (req, res, next) {
  var newUser = User.build(req.body);
  console.log(req.body);
  newUser.save().complete(function(err) {
    if (err) {
      return res.json(400, err);
    }
    req.logIn(newUser, function(err) {
      if (err) return next(err);
      return res.json(newUser);
    });
  });
};

/**
 * addressbook.create
 * requires: {name, address, notes}
 */
var create = function(req, res) {
  var entry = AddressBookEntries.build(req.body)
  entry.UserId = req.user.id;
  entry.save().complete(function(err, entries) {
    if (err) {
      console.log("Erorrrr");
      res.json(500, err);
    } else {
      console.log("Added to the table fine");
      res.json(entry);
    }
  });
};
/*
 * addressbook.all
 * requires: {} 
 */
var all = function(req, res) {
  AddressBookEntries.findAll({where: { UserId: req.user.id}}).complete(function(err, entries) {
    if (err) {
      res.json(500, err);
    } else {
      res.json(entries);
    }
  });
};

/* Finds a single addressbook entry
 * requires {id}
 */
var addrBkId = function(req, res, next, id) {
  AddressBookEntries.find({where: { UserId: req.user.id, id: id}}).complete(function(err, entry) {
    if (err) return next(err);
    if (!entry) return next(new Error('Failed to load addressbook entry ' + id));
    req.entry = entry;
    next();
  });
};

var show = function(req, res) {
  res.json(req.entry);
};

/* Updates an existing blog entry
 * requires an addresbook antry
 */
var update = function(req, res) {
  var entry = req.body;
  AddressBookEntries.find({where: { UserId: entry.UserId, id: entry.id}}).complete(function(err, item) {
    if (err) {
      res.json(500, err);
    } else {
      item.updateAttributes({name: entry.name, address: entry.address, notes: entry.notes})
        .success(function(){res.json(entry);});
    }
  });
};

/*Functions for tickets below. TODO needs to be put in seperate module*/
/**
 * addressbook.create
 * requires: {name, address, notes}
 */
var tkcreate = function(req, res) {
  var ticket = Tickets.build(req.body)
  //console.log(req.body);
  ticket.UserId = req.user.id;
  ticket.save().complete(function(err, entries) {
    if (err) {
      console.log("Erorrrr");
      res.json(500, err);
    } else {
      console.log("Added to the table fine");
      res.json(entries);
    }
  });
};
/*
 * addressbook.all
 * requires: {} 
 */
var tkall = function(req, res) {
  Tickets.findAll({where: { UserId: req.user.id}}).complete(function(err, entries) {
    if (err) {
      res.json(500, err);
    } else {
      res.json(entries);
    }
  });
};

/* Finds a single addressbook entry
 * requires {id}
 */
var ticketId = function(req, res, next, id) {
  console.log("RRrrrrrrrrrrrrrrrrrUNNNNNNNNNNNNINGGGG");
  Tickets.find({where: {UserId: req.user.id, id: id}}).complete(function(err, entry) {
    console.log(entry);
    if (err) return next(err);
    if (!entry) return next(new Error('Failed to load addressbook entry ' + id));
    req.entry = entry;
    next();
  });
};

var tkshow = function(req, res) {
  res.json(req.entry);
};

/* Updates an existing blog entry
 * requires an addresbook antry
 */
var tkupdate = function(req, res) {
  var entry = req.body;
  Tickets.find({where: { UserId: entry.UserId, id: entry.id}}).complete(function(err, item) {
    if (err) {
      res.json(500, err);
    } else {
      item.updateAttributes({email: entry.email, summay: entry.summary, notes: entry.notes})
        .success(function(){res.json(entry);});
    }
  });
};
// route to log in and get session
app.post('/auth/session', login);
app.get('/auth/session', ensureAuthenticated, session);
app.del('/auth/session', ensureAuthenticated, logout);
app.post('/auth/users', userCreate);

// routes to add/del entries to address book
app.post('/api/addressbook', ensureAuthenticated, create);
app.get('/api/addressbook', ensureAuthenticated, all);
app.get('/api/addressbook/:addrBkId', ensureAuthenticated, show);
app.put('/api/addressbook', ensureAuthenticated, update);
//Setting up the blogId param
app.param('addrBkId', addrBkId);

//Routes for tickets
app.post('/api/tickets', ensureAuthenticated, tkcreate);
app.get('/api/tickets', ensureAuthenticated, tkall);
app.get('/api/tickets/:ticketId', ensureAuthenticated, tkshow);
app.put('/api/tickets', ensureAuthenticated, tkupdate);

app.param('ticketId', ticketId);

/* serves main page */
app.get("/", function(req, res) {
  res.sendfile('app/index.html')
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




