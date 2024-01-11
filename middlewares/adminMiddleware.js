const middlewares = {
    adminSession:async(req,res,next)=>{
        try{
           if(req.session.admin){
               next()
           }else{
         res.redirect('/admin/adminLogin')
           }
        }catch(error){
            console.log(error);
            res.status(500)
        }
    },
    AuthenticationMiddleware:async(req,res,next)=>{
        if(req.session.admin){
          return  res.redirect('/admin/adminPanel')
        }else{
            next()
        }
    }
}


module.exports ={middlewares}