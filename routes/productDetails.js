var express = require('express');
var router = express.Router();
const controller = require('../controller/productDetailsController')

router.get('/',controller.product.getAllProduct)

module.exports = router;
