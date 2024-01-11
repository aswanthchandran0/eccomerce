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
            res.redirect('/admin/catagory')

        }catch(errors){
          console.log(errors);
          res.status(500).send('internal server error')
        }
    },
    addCategory: async(req,res)=>{
try{
         const category = req.body.categoryName
         if(category.trim().length===0){
            const   errors = {error: 'category name is required'}
            return res.render('addCatagory', {errors})
         }
         const existedCatagory = await model.findOne({name:{ $regex: new RegExp('^' + category.trim() + '$', 'i') }})
         console.log('existed category',existedCatagory);
         if(existedCatagory){
            const   errors = {error: 'catagory already exists'}
            return res.render('addCatagory', {errors})
         }else{
            const newCatagory = new model({
                name:category
            })
            await newCatagory.save()
            res.redirect('/admin/catagory')
         }

}catch(error){
    console.log(error);
    res.status(500)
}
    }
}

module.exports = {catagoryData}