var express = require('express');
var router = express.Router();
const controller = require('../controller/productListController')
const {checkUserStatus} = require('../controller/middleware')

router.get('/', checkUserStatus, controller.allProducts.showProducts);
module.exports = router; 