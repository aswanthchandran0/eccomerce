

const  checkSession = (req,res,next)=>{
    if(req.session && req.session.admin){
      next();
    } else {
      res.redirect('/adminLogin')
    }
  }

const checkUserStatus =(req,res, next)=>{
  if(req.session.user && req.session.user.userStatus==='blocked'){
    
    res.redirect('/login')
  }else{
    next();
  }
}

  module.exports = {checkSession,checkUserStatus}