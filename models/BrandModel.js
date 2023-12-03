const mongoose = require('mongoose')

const BrandSchema = mongoose.Schema({
    Brand:{
        type:String,
        required:true
    }
})


const BrandModel = mongoose.model('Brand',BrandSchema)
module.exports = BrandModel