const mongoose = require('mongoose');

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
    }
})


const User = mongoose.model('User', userSchema)

module.exports = User