const express = require('express');
const router = express.Router();

router.use('/users', require('./users'));
router.use('/markers', require('./markers'));

module.exports = router;
