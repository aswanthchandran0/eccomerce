const model = require('../models/userModel')
const AddressModel = require('../models/userAddressModel')
const orderData = require('../models/orderModel')
const productModel = require('../models/productModel')
const {isValidFname,isValidEmail,isValidPhoneNumber, isValidPincode,isValidAddress,isValidPlace,isValidstate,isValidLandMark,isValidAphoneNumber} = require('../validators/userAddressValidator');
const { session } = require('passport');
const moment = require('moment');
const Coupon = require('../models/couponModel');

const userProfile = {
    profile: async (req,res)=>{
        try{
        errors = null; 
              const userId = req.session.user._id;
              let hideButton = 0
              const user = await model.findOne({ _id: userId });
              const currentDate = moment();
              const activeCoupons = await Coupon.find({
                couponStatus: 'Active',
                ExpireDate: { $gt: currentDate }, 
            });
              const wallet = user.Wallet
              const walletTransactions = user.walletStatus.reverse()
              console.log('wallet',wallet);
              console.log('wallet transation ',walletTransactions);
              const orderDetails = await orderData.find({userId:userId})
              const productIds = orderDetails.map(order => order.productId).flat();
              const productDetails = await productModel.find({ _id: { $in: productIds } });
              console.log('product details'+productDetails);
              const userAddress = await AddressModel.findOne({ user: userId });
              const addressCount = await AddressModel.countDocuments({ user: userId });
              if(addressCount >=1){
                hideButton=1
              }
              console.log('addresscount',addressCount);
              console.log('active coupon',activeCoupons);
               res.render('userProfile',{ user: req.session.user, ValidationErr:req.session.validationErr,userdata: userAddress,orderDetails,productDetails,wallet,walletTransactions,activeCoupons,updatedAddressValidationErr: req.session.updatedAddressValidationErr,currentPage:'profile',hideButton})
               req.session.AddressValidationErr = null;
               req.session.updatedAddressValidationErr = null
               
            
           
           

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


     
const userAddress = await AddressModel.updateOne(
  {user:req.session.user._id},
  {
    $addToSet:{address:{
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

   }}
  },
  {upsert: true}
)

      

console.log('userAddress',userAddress);
  // await userAddress.save();
   res.redirect('/userProfile')


  }catch(error){
    console.log(error);
    res.status(500).send('internal server error')
  }
   },

   signout: async (req,res)=>{
      req.session.user = false
      res.redirect('/')
   },
   cancelOrder: async (req,res)=>{
    console.log('req reached');
    res.redirect('/userProfile')
   },
   addressHandler:async (req,res)=>{
    try{
         const user = req.session.user
         const index = req.query.index

         if(user !== null && user !== undefined){
        const userId = req.session.user._id
         if(index !== null && index !== undefined){
          const userAddress = await AddressModel.find({user:userId})
          if (userAddress.length > 0 && userAddress[0].address.length > index) {
            const addressData = userAddress[0].address[index];
            res.json({ success: true, address: addressData,index:index });
        }else{
            res.status(404).json({ success: false, error: 'Address not found' });
          }
         }
      }
    }catch(error){
      console.log(error);
      res.status(500)
    }
    const index = req.query.index
    const user = req.session.user
   
  
  },
  updateAddress:async(req,res)=>{
    const {name,email,phoneNumber,pincode,address,place,state,landmark,secondNumber,editAddressType,addressIndex} = req.body
    const user = req.session.user
    try{
      if(user){
        const userId = req.session.user._id
        const userAddress = await AddressModel.findOne({user:userId})
  
  
        const errors = {
          Fname:isValidFname(name),
          Email:isValidEmail(email),
          PhoneNumber:isValidPhoneNumber(phoneNumber),
          Pincode:isValidPincode(pincode),
          Address:isValidAddress(address),
          Place:isValidPlace(place),
          state:isValidstate(state), 
          LandMark:isValidLandMark(landmark),
          AphoneNumber:isValidAphoneNumber(secondNumber)
      }
      
     
    
      const hasErrors =Object.values(errors).some(errors => errors !==null)
    
      if(hasErrors){
  
    req.session.updatedAddressValidationErr    =errors
        return res.redirect('/userProfile')
      }
    
  
  
        if (userAddress && userAddress.length !== 0) {
      
                  const addressToUpdate = userAddress.address[addressIndex]
  
                  addressToUpdate.Fname = name
                  addressToUpdate.Email = email
                  addressToUpdate.PhoneNumber = phoneNumber
                  addressToUpdate.Pincode = pincode
                  addressToUpdate.Address = address
                  addressToUpdate.Place = place
                  addressToUpdate.state = state
                  addressToUpdate.LandMark = landmark
                  addressToUpdate.AphoneNumber = secondNumber
                  addressToUpdate.AddressType = editAddressType
  
                  await userAddress.save();
                  res.redirect('/userProfile')
        }
    
      }
    }catch(error){
               console.log(error);
               res.status(500)
    }

      
  }
  
  }


 
module.exports = {userProfile} 
