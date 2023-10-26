const model = require('../models/catagoryModel')


const catagoryData = {
    getAllCatagory : async (req,res)=>{
        try{
           const Catagories = await model.find()
           res.render('catagory',{Catagories})
        }catch {
            console.error(error);
            res.status(500).send('Internal Server Error');
        }
    },
    deleteCatagory: async (req,res)=>{
        const catagoryId = req.params.id
        console.log(catagoryId);
        try{
            await model.findByIdAndRemove(catagoryId)
            res.redirect('/catagory')

        }catch(errors){
          console.log(errors);
          res.status(500).send('internal server error')
        }
    }
}

module.exports = {catagoryData}