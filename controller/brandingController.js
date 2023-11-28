
const branding = {
    brandingPage: async(req,res)=>{
      try{
         res.render('branding')
      }catch(error){
     console.log(error);
     res.status(500).send('internal server error')
      }
    }
}

module.exports = {branding}