
// validation function

function isValidFname(Fname){
    if(Fname.length===0){
      return 'please enter your first name.'
    }
    return null
  }
  
  function isValidEmail(Email){
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if(!emailRegex.test(Email)){
      return 'please enter a valid email address' 
    }
    return null
  }
  
  function isValidPhoneNumber(PhoneNumber){
    if(!/^\d{10}$/.test(PhoneNumber)){
      return 'please enter a valid 10-digit phone number'
    }
    return null
  }
  
  function isValidPassword(Password){
   if(Password.length<6){
    return 'password must be atleast 6 character long'
   }
   return null
  }
  
  function isPasswordMatch(Password,Cpassword){
    if( Password !== Cpassword){
     return 'password doesnot match'
    }
    return null
  }

  function isValidOtp(otp,generatedOtp){
    
      return otp === generatedOtp
  }



  
  module.exports = {
    isValidFname,isValidEmail,isValidPhoneNumber,isValidPassword,isPasswordMatch,isValidOtp
  }