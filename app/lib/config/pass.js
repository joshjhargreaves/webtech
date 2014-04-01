'use strict';

var passport = require('passport'),
    LocalStrategy = require('passport-local').Strategy,
    Sequelize = require('sequelize'), 
    sequelize = new Sequelize('maxwallet', 'postgres', 'Compost12!', {
      dialect: "postgres", // or 'sqlite', 'postgres', 'mariadb'
      port:    5432, // or 5432 (for postgres)
    })

exports.login = function (req, res, next) {
  passport.authenticate('local', function(err, user, info) {
    var error = err || info;
    if (error) { return res.json(400, error); }
    req.logIn(user, function(err) {
      if (err) { return res.send(err); }
      res.json(req.user.user_info);
    });
  })(req, res, next);
}

/**
 * Session
 * returns info on authenticated user
 */
exports.session = function (req, res) {
  res.json(req.user.user_info);
};

exports.ensureAuthenticated = function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) { return next(); }
  res.send(401);
}