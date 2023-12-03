const BrandModel = require('../models/BrandModel')

const branding = {
    brandingPage: async(req,res)=>{
      try{
        const Brands = await BrandModel.find({})
         res.render('branding',{Brands})
      }catch(error){
     console.log(error);
     res.status(500).send('internal server error')
      }
    },
    addBrand:async(req,res)=>{
      try{
       const BrandName = req.body.brandName
       if(BrandName){
        const newBrand = new BrandModel({
          Brand:BrandName
        })

        await newBrand.save()
      }
        res.redirect('/admin/branding')

      }catch(error){
        console.log(error)
        res.status(500).send('internal server error')
      }
    },
    deleteBrand: async(req,res)=>{
      try{
       const brandId = req.body.brandId
       console.log('brand id',brandId);
       await BrandModel.findOneAndDelete({ _id: brandId });

       res.redirect('/admin/branding')
      }catch(error){
        console.log(error);
        res.status(500).send('internal server error')
      }
    }
}

module.exports = {branding}