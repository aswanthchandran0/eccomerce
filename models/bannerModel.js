const mongoose = require('mongoose')



const bannerSchema = mongoose.Schema({
    image:{
        type:String,
        required:true
    },
    subText1:{
        type:String,
        required:true
    },
    mainText:{
        type:String,
        require:true
    },
    subText2:{
        type:String,
        required:true
    },
    buttonText:{
           type:String,
           required:true
    },
    url:{
        type:String,
        required:true
    }
})

const bannerModel = mongoose.model('banners',bannerSchema)

module.exports = bannerModel