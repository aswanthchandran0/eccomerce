function isValidPincode(Pincode){

    if(Pincode === undefined || Pincode === null || Pincode.length === 0){
        return 'pincode is required'
    }
    return null
}

function isValidAddress(Address){
    if(Address === undefined|| Address ===null || Address.length ===0){
        return 'address is required'
    }
    return null
}

function isValidPlace(Place){
    if(Place ===undefined || Place ===null || Place.length ===0){
        return 'place is required'
    }
    return null
}

function isValidstate(state){
    if( state ===undefined || state ===null || state.length ===0){
        return 'state is required'
    }
    return null
}

function isValidLandMark(LandMark){
    if(LandMark ===undefined || LandMark ===null || LandMark.length ===0){
        return 'landmark is required'
    }
    return null
}

function isValidAphoneNumber(AphoneNumber){
    if(AphoneNumber ===undefined || AphoneNumber ===null || AphoneNumber.length !== 10 || !/^\d+$/.test(AphoneNumber)){
        return 'valid phonenumber is required'
    }
    return null
}

module.exports = {isValidPincode,isValidAddress,isValidPlace,isValidstate,isValidLandMark,isValidAphoneNumber} 