const express = require('express')
const router = express.Router()
const controller = require('../controller/brandingController')

router.get('/',controller.branding.brandingPage)


module.exports = router