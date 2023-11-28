var express = require('express');
var router = express.Router();
const controller = require('../controller/adminOrderController')


router.get('/', controller.orderStatus.orderStatusPage);
router.get('/selectedValue/:selectedValue/orderId/:orderId', controller.orderStatus.updateOrderStatus);
module.exports = router; 