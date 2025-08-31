const Banner = require("../models/bannerModel");
const fs = require("fs");
const path = require("path");
const bannerService = require("../services/bannerService")
const bannerValidator = require("../validators/bannerValidation")

const banner = {
  bannerPage: async (req, res, next) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 8;

      const { data: banners, pagination } = await bannerService.getBanner({
        page,
        limit,
      });
      console.log("banner",banners)

       res.render("banner/list", {
        banners,
        pagination,
        successMessage: res.locals.success,
        errorMessage: res.locals.error,
      });
    } catch (err) {
      err.function = "bannerPage";
      next(err);
    }
  },

   addBanner: async (req, res, next) => {
    try {
        if (req.file) {
      req.body.image = `/uploads/banners/${req.file.filename}`;
    }
        console.log(
          'request body',req.body
        )
      const { error, value } = bannerValidator.validate(req.body, {
        abortEarly: false,
        stripUnknown: true,
      });

      if (error) {
        const formattedErrors = error.details.reduce((acc, err) => {
          const field = err.path.join(".");
          acc[field] = err.message;
          return acc;
        }, {});

        return res.status(400).json({
          success: false,
          errors: formattedErrors,
        });
      }

      console.log(
        'value',value
      )
    const banner = new Banner(value);
    
          console.log('BANNER',banner)
      await banner.save();
      req.flash("success", `banner "${banner.headline}" created  successfully`);
      res.json({ success: true });
    } catch (err) {
      err.function = "addBanner";
      next(err);
    }
  },

 editBanner:async (req, res, next) => {
  try {
    const bannerId = req.params.id; // assuming URL: /admin/banners/:id
    const banner = await Banner.findById(bannerId);

    if (!banner) {
      return res.status(404).json({
        success: false,
        message: "Banner not found"
      });
    }
      req.body.image = banner.image;

    // Validate the updated data
    const { error, value } = bannerValidator.validate(req.body, {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      const formattedErrors = error.details.reduce((acc, err) => {
        const field = err.path.join(".");
        acc[field] = err.message;
        return acc;
      }, {});

      return res.status(400).json({
        success: false,
        errors: formattedErrors
      });
    }

    // Update banner fields
    Object.assign(banner, value);
    await banner.save();

    req.flash("success", `Banner "${banner.headline}" updated successfully`);
    res.json({ success: true, banner });
    
  } catch (err) {
    err.function = "editBanner";
    next(err);
  }
}

  // bannerPage: async(req,res)=>{
  //     try{
  //         let bannerAdded = '';
  //         let bannerDeleted = '';
  //         if(req.query.bannerAdded){
  //             bannerAdded = req.query.bannerAdded
  //             console.log('bannerAdded',bannerAdded);
  //         }
  //         if(req.query.bannerDeleted){
  //             bannerDeleted = req.query.bannerDeleted
  //         }
  // const latestBanner = await bannerModel.find().sort({_id:-1})
  //                console.log('latestst banner',latestBanner);
  //        res.render('banner',{latestBanner:latestBanner,bannerAdded,bannerDeleted})
  //     }catch(error){
  //         console.log(error);
  //         res.status(500).send('internal server error')
  //     }
  // },
  // addBanner: async (req,res)=>{
  //     try{
  //         console.log('request reaching');
  //         const {subText1,MainText,subText2,ButtonText,url} = req.body
  //         const bannerImage = req.file

  //         console.log('banner image',bannerImage);
  //         console.log('banner image filename', bannerImage.filename);
  //         console.log('button text',ButtonText);
  //         const newBanner = new bannerModel({
  //             image:bannerImage.filename,
  //             subText1:subText1,
  //             mainText:MainText,
  //             subText2:subText2,
  //             buttonText:ButtonText,
  //             url:url,

  //         })
  //         await newBanner.save()
  //         console.log('new banner',newBanner);
  //         res.redirect('/admin/banner/?bannerAdded=sucess')

  //     }catch(error){
  //         console.log(error);
  //         res.status(500)
  //     }
  // },
  // deleteBanner: async(req,res)=>{
  //   const bannerId = req.query.bannerId
  //  const deleteBanner = await bannerModel.findByIdAndDelete(bannerId)
  //  console.log('deletebanner',deleteBanner);
  //   const  imagePath = path.join(__dirname,'..','bannerImages',deleteBanner.image)
  //     fs.unlinkSync(imagePath)

  //     res.redirect('/admin/banner/?bannerDeleted=sucess')

  // }
};

module.exports = { banner };
