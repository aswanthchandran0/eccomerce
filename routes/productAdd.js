
const express = require('express');
const router = express.Router();
const multer = require('multer')
const path = require('path');
const productController = require('../controller/productController');

const catagoryModel = require('../models/catagoryModel')


router.get('/', async (req,res)=>{
    const Catagories = await catagoryModel.find({}) 

    console.log(Catagories);
 res.render('productAdd',{Catagories})
})

//router.post('/addProduct', productController.addproduct)

const storage = multer.diskStorage({
    destination: function(req,file,cb){
        cb(null,'uploads/')
    },
    filename: function (req,file,cb){
       const  uniqueSuffix = Date.now() + '-'+Math.round(Math.random()* 1E9)
       cb(null,file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname))
    }
})

const upload = multer({storage:storage})



router.post('/addProduct', upload.array('images', 4), productController.addproduct);  

module.exports = router;