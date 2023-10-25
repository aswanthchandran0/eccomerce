var express = require('express');
var router = express.Router();
const {checkUserStatus} = require('../controller/middleware')


router.get('/',checkUserStatus, function(req, res, next) {
  res.render('catagory', { title: 'Express' });
});

module.exports = router; 