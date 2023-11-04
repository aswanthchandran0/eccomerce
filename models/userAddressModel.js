const mongoose = require('mongoose')

const userAdress = mongoose.Schema({
   Address:[
      {
    user:{
        type:String,
        required:true,
    },
 Fname:{
    type:String,
    required: true
 },
 
 Email:{
  type:String,
  required:true
 },
 PhoneNumber:{
   type:String,
   required:true
  },

 Pincode:{
    type:String,
    required:true
 },
 Address:{
    type:String,
    required:true
 },
 Place:{
    type:String,
    required:true 
 },
 state:{
    type:String,
    required:true
 },
 LandMark:{
    type:String,
    required:true
 },
 AphoneNumber:{
    type:String,
    required:true
 },
 AddressType:{
    type:String,
    required:true
 }

}
   ]

})
 
const Address = mongoose.model('Address',userAdress)

module.exports = Address