var express = require('express');
var router = express.Router();
const {checkUserStatus} = require('../controller/middleware')
/* GET home page. */
router.get('/',checkUserStatus, function(req, res, next) {
  res.render('index', { title: 'Express' });
});

module.exports = router; 