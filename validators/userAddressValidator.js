function isValidFname( Fname){
    if( Fname.length ===0){
        return 'name is required'
    }
    return null
}

function isValidEmail(Email){
    if(Email.length ===0){
        return 'email is required'
    }
    return null
}

function isValidPhoneNumber(PhoneNumber){
    if(PhoneNumber.length !== 10){
        return ' invalid phonenumber'
    }
    return null
}


function isValidPincode(Pincode){

    if(Pincode.length === 0){
        return 'pincode is required'
    }
    return null
}

function isValidAddress(Address){
    if(Address.length ===0){
        return 'address is required'
    }
    return null
}

function isValidPlace(Place){
    if(Place.length ===0){
        return 'place is required'
    }
    return null
}

function isValidstate(state){
    if(state.length ===0){
        return 'state is required'
    }
    return null
}

function isValidLandMark(LandMark){
    if(LandMark.length ===0){
        return 'landmark is required'
    }
    return null
}

function isValidAphoneNumber(AphoneNumber){
    if(AphoneNumber.length !== 10 ){
        return 'valid phonenumber is required'
    }
    return null
}

module.exports = {isValidFname,isValidEmail,isValidPhoneNumber,isValidPincode,isValidAddress,isValidPlace,isValidstate,isValidLandMark,isValidAphoneNumber} 