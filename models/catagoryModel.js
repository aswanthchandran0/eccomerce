const mongoose = require('mongoose')


const catagoryShema = new mongoose.Schema({
 name:{
    type:String,
    required:true,
    unique:true
 }
})




const Category = mongoose.model('Category',catagoryShema)


module.exports = {Category}