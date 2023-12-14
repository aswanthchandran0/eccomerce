const mongoose = require('mongoose')

const wishlistSchema = new mongoose.Schema({
    userId:{
        type:String,
        required:true
    },
    products:[{
        productId:{
            type:String,
            required:true
        }
    }
    ]
})

const wishlist = mongoose.model('wishlist',wishlistSchema)

module.exports = wishlist