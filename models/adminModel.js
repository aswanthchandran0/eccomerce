const mongoose = require('mongoose')


const loginSchema = new mongoose.Schema({
    Email: {
        type:String,
        required:true
    },
    Password: {
        type:String,
        required:true,
    }
})

const Admin= mongoose.model('Admin',loginSchema) 

module.exports = Admin