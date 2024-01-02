const userData = require('../models/userModel')
const middlewares = {
  userSession: async(req,res,next)=>{
      try{
            if(req.session.user){
          const uservalidation = await userData.findById(req.session.user._id)
              if(uservalidation && uservalidation.Authentication === 'verified'){
                return next()
              }
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
  }
}

module.exports = {middlewares}