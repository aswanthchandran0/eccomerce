var express = require('express');
var router = express.Router();
var controller = require('../controller/addCatagoryController')

router.get('/', function(req, res, next) {
  res.render('addCatagory', { title: 'Express',errors:null  });
});

router.post('/add' ,controller.catagoryData.createCatagory)

module.exports = router; 