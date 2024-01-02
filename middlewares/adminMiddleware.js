const middlewares = {
    adminSession:async(req,res,next)=>{
        try{
           if(req.session.admin){
               next()
           }else{
            res.redirect('/adminLogin')
           }
        }catch(error){
            console.log(error);
            res.status(500)
        }
    }
}


module.exports ={middlewares}