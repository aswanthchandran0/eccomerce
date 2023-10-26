var express = require('express');
var router = express.Router();
const controller = require('../controller/indexControler')
const {checkUserStatus} = require('../controller/middleware')

router.get('/', checkUserStatus, controller.homePage.showProducts);
module.exports = router; 