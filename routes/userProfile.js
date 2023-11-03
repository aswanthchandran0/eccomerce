 
const express = require('express')
var router = express.Router()
const controller = require('../controller/userProfileController')
const middleware = require('../middlewares/userMiddlewares')


router.get('/', controller.userProfile.profile,)

router.post('/address',controller.userProfile.userAddress)

module.exports = router; 