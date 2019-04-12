var express = require('express');
var router = express.Router();
var models  = require('../models');

/* API routes */
router.use('/apiV1', require('./apiV1'));

/* GET home page. */
router.get('/', function(req, res, next) {
  models.User.findAll().then(function(users){
    res.render('index', {
      title: 'Express',
      users: users
    });
  })
});

module.exports = router;
