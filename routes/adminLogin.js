var express = require('express');
var router = express.Router();
var controller = require('../controller/aLoginController')

router.get('/', function(req, res, next) {
  res.render('adminLogin', { title: 'Express', errors:null });
});

router.post('/login', controller.validation)
module.exports = router;
