const catagory = require('../models/catagoryModel') 
const catagoryData= {
   createCatagory : async (req,res)=>{
    
    const Name= req.body.Name
    
     try{
        
        if(!Name){
          const errors = {error: '  is required'}
            res.render('addCatagory ', {errors})

        } 
        const existedCatagory = await catagory.findOne({name:Name})
        if(existedCatagory){
            
            const   errors = {error: 'catagory already exists'}
           return res.render('addCatagory', {errors})
        } else{
          const newCatagory =  new catagory({
            name:Name,
         })
       await   newCatagory.save()
       res.redirect('/catagory')
        }
           
       
        
        
     }
     catch(error){
        console.error(error.message);
        console.error(error.stack)
 
            if (error.name === 'ValidationError') {
                const errors = { error: error.message };
                return res.render('addCatagory', { errors });
            }


        res.status(500).json({ error: 'Internal Server Error' });
     }
   
   }
}

module.exports = {catagoryData}