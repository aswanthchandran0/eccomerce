function isValidFname( Fname){
    const nameRegex = /^[a-zA-Z\s]+$/;
    if(Fname.trim().length===0){
      return 'please enter your first name.'
    }else if(!nameRegex.test(Fname)){
      return 'name should only contain letter'
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
    if(!/^\d{10}$/.test(PhoneNumber) || PhoneNumber ==='0000000000'){
        return 'please enter a valid 10-digit phone number'
      }
      return null
}


function isValidPincode(Pincode){

    if(Pincode.trim().length === 0){
        return 'pincode is required'
    }
    return null
}

function isValidAddress(Address){
    if(Address.trim().length ===0){
        return 'address is required'
    }
    return null
}

function isValidPlace(Place){
    if(Place.trim().length ===0){
        return 'place is required'
    }
    return null
}

function isValidstate(state){
    if(state.trim().length ===0){
        return 'state is required'
    }
    return null
}

function isValidLandMark(LandMark){
    if(LandMark.trim().length ===0){
        return 'landmark is required'
    }
    return null
}

function isValidAphoneNumber(AphoneNumber){
    if(!/^\d{10}$/.test(AphoneNumber) || AphoneNumber ==='0000000000' ){
        return 'valid phonenumber is required'
    }
    return null
}

module.exports = {isValidFname,isValidEmail,isValidPhoneNumber,isValidPincode,isValidAddress,isValidPlace,isValidstate,isValidLandMark,isValidAphoneNumber} 