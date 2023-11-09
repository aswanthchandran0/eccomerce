const model = require('../models/userModel')
const AddressModel = require('../models/userAddressModel')
const {isValidFname,isValidEmail,isValidPhoneNumber, isValidPincode,isValidAddress,isValidPlace,isValidstate,isValidLandMark,isValidAphoneNumber} = require('../validators/userAddressValidator');
const { session } = require('passport');


const userProfile = {
    profile: async (req,res)=>{
        try{
        errors = null; 
            if(req.session.user){
                
             
              const userId = req.session.user._id;
              const userAddress = await AddressModel.findOne({ user: userId });
               res.render('userProfile',{ user: req.session.user, ValidationErr:req.session.validationErr,userdata: userAddress})
               req.session.AddressValidationErrors = null;
               
            }
            else{
                res.redirect('/login')
            }
           

        } catch(errors) {
           console.log(errors) 
           res.status(500).send('internal server error')
        }
          
    }, 
   userAddress: async (req,res)=>{





    const {Fname,Email,PhoneNumber,Pincode,Address,Place, state,LandMark,AphoneNumber,AddressType}= req.body
   // const {Fname,Email,PhoneNumber,}= req.session.user

  
    const errors = {
      Fname:isValidFname(Fname),
      Email:isValidEmail(Email),
      PhoneNumber:isValidPhoneNumber(PhoneNumber),
      Pincode:isValidPincode(Pincode),
      Address:isValidAddress(Address),
      Place:isValidPlace(Place),
      state:isValidstate(state), 
      LandMark:isValidLandMark(LandMark),
      AphoneNumber:isValidAphoneNumber(AphoneNumber)
  }
  
 

  const hasErrors =Object.values(errors).some(errors => errors !==null)

  if(hasErrors){
    req.session.validationErr = errors; 
   
    return res.redirect('/userProfile')
  }



    try{


   const userAddress = new AddressModel({
    user: req.session.user._id,
    address:[{
      Fname:Fname,
      Email:Email,
      PhoneNumber:PhoneNumber,
      Pincode:Pincode,
      Address:Address,
      Place:Place,
      state:state,
      LandMark:LandMark,
      AphoneNumber:AphoneNumber, 
      AddressType:AddressType

   }] 
   })
   await userAddress.save();
   res.redirect('/userProfile')

  }catch(error){
    console.log(error);
    res.status(500).send('internal server error')
  }
   },

   signout: async (req,res)=>{
      req.session.destroy()
      res.redirect('/')
   }

  }


 
module.exports = {userProfile} 