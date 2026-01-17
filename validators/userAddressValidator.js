// userAddressValidator.js - FIXED with null checks
function isValidFname(Fname) {
    if (!Fname || Fname.trim().length === 0) {
        return 'Please enter your first name.';
    }
    const nameRegex = /^[a-zA-Z\s]+$/;
    if (!nameRegex.test(Fname)) {
        return 'Name should only contain letters.';
    }
    return null;
}

function isValidEmail(Email) {
    if (!Email) {
        return 'Email is required.';
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(Email)) {
        return 'Please enter a valid email address.';
    }
    return null;
}

function isValidPhoneNumber(PhoneNumber) {
    if (!PhoneNumber) {
        return 'Phone number is required.';
    }
    if (!/^\d{10}$/.test(PhoneNumber) || PhoneNumber === '0000000000') {
        return 'Please enter a valid 10-digit phone number.';
    }
    return null;
}

function isValidPincode(Pincode) {
    if (!Pincode || Pincode.trim().length === 0) {
        return 'Pincode is required.';
    }
    if (!/^\d{6}$/.test(Pincode)) {
        return 'Please enter a valid 6-digit pincode.';
    }
    return null;
}

function isValidAddress(Address) {
    if (!Address || Address.trim().length === 0) {
        return 'Address is required.';
    }
    if (Address.trim().length < 5) {
        return 'Address must be at least 5 characters.';
    }
    return null;
}

function isValidPlace(Place) {
    if (!Place || Place.trim().length === 0) {
        return 'City/Town is required.';
    }
    return null;
}

function isValidstate(state) {
    if (!state || state.trim().length === 0) {
        return 'State is required.';
    }
    return null;
}

function isValidLandMark(LandMark) {
    // Landmark is optional, so no validation needed
    return null;
}

function isValidAphoneNumber(AphoneNumber) {
    // Alternate phone is optional, but if provided, validate it
    if (AphoneNumber && AphoneNumber.trim().length > 0) {
        if (!/^\d{10}$/.test(AphoneNumber) || AphoneNumber === '0000000000') {
            return 'Please enter a valid 10-digit alternate phone number.';
        }
    }
    return null;
}

module.exports = {
    isValidFname,
    isValidEmail,
    isValidPhoneNumber,
    isValidPincode,
    isValidAddress,
    isValidPlace,
    isValidstate,
    isValidLandMark,
    isValidAphoneNumber
};