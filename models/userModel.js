const mongoose = require('mongoose');


const walletTransactionSchema = new mongoose.Schema({
    status: {
        type: String,
        enum: ['credited', 'debited'],
        required: true
    },
    amount:{
        type: Number,
        required: true
    },
    timestamp: {
        type: Date
    },
   
}, { _id: false });


const userSchema = new mongoose.Schema({
    Fname:{
     type:String,
     required:true
    },
    Email:{
        type:String,
        required:true
    },
    PhoneNumber:{
        type:Number,
        required:true,
    },
    Password:{
     type:String,
     required:true
    },
    userStatus:{
        type:String,
        enum:['active','blocked'],
        default:'active'
    },
    Wallet:{
        type:Number,
        default:0,
        required:true
    },
    walletStatus:{
        type:[walletTransactionSchema],
    },
    referalCode:{
        type:Number,
        required:true
    }
})


const User = mongoose.model('User', userSchema)

module.exports = User