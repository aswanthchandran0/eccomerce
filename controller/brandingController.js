const BrandModel = require('../models/BrandModel')

const branding = {
    brandingPage: async(req,res)=>{
      const BRAND_PER_PAGE = 10
      try{
        const page = parseInt(req.query.page) || 1
        const totalBrands = await BrandModel.countDocuments({})
        const totalPages = Math.ceil(totalBrands/BRAND_PER_PAGE)
        const Brands = await BrandModel.find({})
        .skip((page-1)*BRAND_PER_PAGE)
        .limit(BRAND_PER_PAGE)
         res.render('branding',{Brands,totalPages,currentPage:page})
      }catch(error){
     console.log(error);
     res.status(500).send('internal server error')
      }
    },
    addBrand:async(req,res)=>{
      try{
       const BrandName = req.body.brandName.trim()
       const existedBrand = await BrandModel.findOne({Brand:{ $regex: new RegExp('^' + BrandName, 'i') }})
       if(existedBrand){
        return res.redirect('/admin/branding')
       }
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