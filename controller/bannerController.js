 const bannerModel = require('../models/bannerModel')
 const fs = require('fs')
 const path = require('path');
const banner ={
    bannerPage: async(req,res)=>{
        try{
            let bannerAdded = '';
            let bannerDeleted = '';
            if(req.query.bannerAdded){
                bannerAdded = req.query.bannerAdded
                console.log('bannerAdded',bannerAdded);
            }
            if(req.query.bannerDeleted){
                bannerDeleted = req.query.bannerDeleted
            }
    const latestBanner = await bannerModel.find().sort({_id:-1})
                   console.log('latestst banner',latestBanner);
           res.render('banner',{latestBanner:latestBanner,bannerAdded,bannerDeleted})
        }catch(error){
            console.log(error);
            res.status(500).send('internal server error')
        }
    },
    addBanner: async (req,res)=>{
        try{
            console.log('request reaching');
            const {subText1,MainText,subText2,ButtonText,url} = req.body
            const bannerImage = req.file

            console.log('banner image',bannerImage);
            console.log('banner image filename', bannerImage.filename);
            console.log('button text',ButtonText);
            const newBanner = new bannerModel({
                image:bannerImage.filename,
                subText1:subText1,
                mainText:MainText,
                subText2:subText2,
                buttonText:ButtonText,
                url:url,

            })
            await newBanner.save()
            console.log('new banner',newBanner);
            res.redirect('/admin/banner/?bannerAdded=sucess')

        }catch(error){
            console.log(error);
            res.status(500)
        }
    },
    deleteBanner: async(req,res)=>{
      const bannerId = req.query.bannerId
     const deleteBanner = await bannerModel.findByIdAndDelete(bannerId)
     console.log('deletebanner',deleteBanner);
      const  imagePath = path.join(__dirname,'..','bannerImages',deleteBanner.image)
        fs.unlinkSync(imagePath)

        res.redirect('/admin/banner/?bannerDeleted=sucess')

    }
}


module.exports = {banner}