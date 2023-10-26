var express = require('express');
var router = express.Router();
const controller = require('../controller/catagoryController')

router.get('/',controller.catagoryData.getAllCatagory)
router.post('/delete/:id',controller.catagoryData.deleteCatagory)

module.exports = router; 