const  orderDetails = require('../models/orderModel')

const AdminPanel = {
   adminPanel: async (req,res)=>{
    try{
      const orderData = await orderDetails.find()
      console.log(orderData);
        res.render('AdminPanel',{orderData:orderData})
    }catch(error){
        console.log(error);
        res.status(500).send('internal server error')
    }
           
   },
    logout : async(req,res)=>{
        try{
             await req.session.destroy() 
             res.redirect('/adminLogin');
        }catch(errors) {
            console.error('Error destroying session:', error);
            res.status(500).send('Internal Server Error');
        }
    }
    
}

module.exports = {AdminPanel}