'use strict';

var models  = require('../models');
var passport = require('passport');
var localStrat = require('passport-local');

var User = models.User;

passport.use(new localStrat({
  usernameField: 'username',
  passwordField: 'password',
}, (username, password, done) => {
  User.findOne({ where: { username: username } }).then((user) => {
    if(!user || !user.validatePassword(password)) {
      return done(null, false, { errors: {'username or password': 'is invalid'}});
    }
    return done(null, user);
  }).catch(done);
}));
