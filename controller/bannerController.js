const multer = require('multer');
const path = require('path');
const Banner = require('../models/bannerModel');
const { findByIdAndDelete } = require('../models/productModel');

const banner = {
    bannerPage: async (req,res)=>{
        try{
            const banners = await Banner.find()
            console.log('banners', banners);
            res.render('banner',{banners})
        }catch(error){
            console.log(error);
            res.status(500).send('internal server error')
        }
    },
    handleUpload: async (req,res)=>{
        try{
            console.log('req reached');
          const file = req.file
          const { subText1, mainText, subText2, buttonText } = req.body;
          console.log('req.body',req.body);
          const fileName = Date.now() + path.extname(file.originalname);
          const filePath = path.join(__dirname,'..', 'bannerImages', fileName);
           const newBanner = new Banner({
            homePage: [{
                Images:fileName,
                bannerSubtext1:subText1,
                bannerMainText:mainText,
                bannerSubText2:subText2,
                bannerButtonText:buttonText
           }]
           })
           await newBanner.save()
          require('fs').writeFileSync(filePath, file.buffer);
          res.json({ message: 'File uploaded successfully', fileName });
          console.log('file',file);
        }catch(error){
            console.log(error);
            res.status(500).send('internal server error')
        }
    },
    bannerDeletion: async (req,res)=>{
        try{
         const {bannerId,index}= req.query
         const banner = await Banner.findById(bannerId)
         if (banner && banner.homePage && banner.homePage[index]) {
        
            await Banner.findByIdAndUpdate(
                bannerId,
                { $pull: { 'homePage': { _id: banner.homePage[index]._id } } },
                { new: true }
            );
            res.redirect('./banner');
        } 
        }catch(error){
            console.log(error);
            res.status(500).send('internal server error')
        }
      
    }
   
}


module.exports = {banner}