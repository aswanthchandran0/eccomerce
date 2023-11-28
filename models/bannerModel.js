const mongoose = require('mongoose')

const bannerSchema = mongoose.Schema({
    homePage:[{
        Images:{
            type:String,
            required:true
        },
        bannerSubtext1:{
            type:String,
            required:true
        },
        bannerMainText:{
            type:String,
            required:true
        },
        bannerSubText2:{
            type:String,
            required:true
        },
        bannerButtonText:{
            type:String,
            required:true
        }
    }]
})

const banner = mongoose.model('Banner', bannerSchema)

module.exports = banner