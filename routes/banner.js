const express = require('express')
const router = express.Router()
const controller = require('../controller/bannerController')
const multer = require("multer");

const storage = multer.memoryStorage();
const bannerImages = multer({storage: storage})

router.get('/',controller.banner.bannerPage)
router.post('/upload-image', bannerImages.single('image'), controller.banner.handleUpload);
router.get('/delete',controller.banner.bannerDeletion)
module.exports = router