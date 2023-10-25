const Admin = require('../models/adminModel');
const bcrypt = require('bcrypt');




const validation = async (req,res)=>{
 const {Email,Password}= req.body
  const admin = await Admin.findOne({Email:Email})

  if(admin){
    if(admin){
      const PaswordMatch = await bcrypt.compare(Password, admin.Password)
      
      if(PaswordMatch){
        req.session.admin = admin
    res.redirect('/AdminPanel')
    }
 }
    }
 
  else{
    const errors = {login: 'Access Denied'}
   res.render('adminLogin',{errors})
  }
}


module.exports = {validation}