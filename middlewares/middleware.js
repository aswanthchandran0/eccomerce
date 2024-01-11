const { session } = require('passport');
const userData = require('../models/userModel')
const cartModel = require('../models/cartModel')
const middlewares = {
  userSession: async(req,res,next)=>{
      try{
            if(req.session.user){
          const uservalidation = await userData.findById(req.session.user._id)

              if(uservalidation && uservalidation.Authentication === 'verified' && uservalidation.userStatus ==='active'){
                return next()
              }
             req.session.user = false

              res.redirect('/login')
            }else{
              res.redirect('/login')
            }
             
              
      }catch(error){
        console.log(error);
        res.status(500)
      }
  },
  AuthenticationMiddleware: async(req,res,next)=>{
    if(req.session.user){
   const uservalidation = await userData.findById(req.session.user._id)
   if(uservalidation && uservalidation.Authentication === 'verified'){
     return res.redirect('/')
   }
   next()
    }else{
      next()
    }
  },
   forOtpPage: async(req,res,next)=>{
       if(req.session.user){
             const otp_Expire_Duration = 3 * 60 * 1000
             const currentTimestamb = Date.now()
             const userId = req.session.user._id
             const user = await userData.findById(userId)
             const otpTimeStamb = user.otpTimeStamb
             if(otpTimeStamb !== null && otpTimeStamb !== undefined && currentTimestamb - otpTimeStamb<otp_Expire_Duration){
                 next();
             }else{
              return res.redirect('/signup')
             }
   
             
       }else{
        res.redirect('/signup')
       }
      
   },
   orderPageMiddleware: async(req,res,next)=>{
     if(req.session.user){
      const userId = req.session.user._id
      const userCart = await cartModel.findOne({userId:userId})
      if(userCart !== null && userCart !== undefined && userCart.products.length>0){
        next()
      }else{
        return res.redirect('/cart')
      }
     }else{
      res.redirect('/login')
     }
   },
    orderSucessMiddleware: async(req,res,next)=>{
        if(req.session.user){
          const userId = req.session.user._id
          const userCart = await cartModel.findOne({userId:userId})
          if(userCart !== null && userCart !== undefined && userCart.products.length>0){
            next()
          }else{
            return res.redirect('/')
          }
        }else{
          res.redirect('/')
        }
    }
}

module.exports = {middlewares}