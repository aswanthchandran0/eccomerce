const Razorpay = require('razorpay');

const paymentGateway = { 
  generateRazorPay: async (orderId, totalPrice) => {
    console.log('orderId:', orderId);
    console.log('totalPrice:', totalPrice);
    const  totalPriceInPaise =Math.round(totalPrice * 100)
    try {
      console.log('total price in generated razor'+totalPrice);
      var instance = new Razorpay({
        key_id: 'rzp_test_SoEmBjOco04Lhe',
        key_secret: '0sk7KMqW8V3HthmebsRFLx5A',
      });

      const order = await instance.orders.create({
        amount: totalPriceInPaise,
        currency: 'INR',
        receipt: ""+orderId, 
        notes: {
          key1: 'value3',
          key2: 'value2',
        },
      });

      return order;
    } catch (error) {
      console.error(error);
    }
  },
};

module.exports = { paymentGateway };
