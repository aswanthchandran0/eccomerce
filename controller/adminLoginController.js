const Admin = require('../models/adminModel');
const bcrypt = require('bcrypt');


const loginPage = async (req,res)=>{
  try{
    let errors = null
 res.render('adminLogin',{errors})
  }catch(error){
    console.log(error);
    res.status(500)
  }
}


const validation = async (req,res)=>{
  console.log('request reaching');
 const {Email,Password}= req.body
  const admin = await Admin.findOne({Email:Email})

  if(admin){
  
      const PaswordMatch = await bcrypt.compare(Password, admin.Password)
      
      if(PaswordMatch){
        req.session.admin = admin
    res.redirect('/admin/adminPanel')
    }else{
      const errors = {login: 'Access Denied'}
   return res.render('adminLogin',{errors})
    }
 
    }
 
  else{
    const errors = {login: 'Access Denied'}
   res.render('adminLogin',{errors})
  }
}


module.exports = {validation,loginPage}