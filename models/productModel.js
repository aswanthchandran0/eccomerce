const mongoose = require('mongoose');


const variantSchema = new mongoose.Schema({
  size: {
    type: String,
    required: true,
    trim: true,
    enum: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
  },
  stock: {
    type: Number,
    required: true,
    min: 0,
    default: 0,
  },

}, { _id: false }); // No separate _id for variants




const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100,
    index: true, // For fast search
  },
  price: {
    type: mongoose.Decimal128,
    required: true,
    min: 0,
  },
  description: {
    type: String,
    trim: true,
    maxlength: 500,
    default: '',
  },
  category: {
    type: String, // Use String for category_name (as in your banners)
    required: true,
    trim: true,
    index: true, // For filtering
  },
  brand: {
    type: String, // Use String for brand_name
    required: true,
    trim: true,
    index: true, // For filtering
  },
  variants: {
    type: [variantSchema],
    required: true,
    validate: {
      validator: (arr) => arr.length > 0,
      message: 'At least one variant is required',
    },
  },
  images: {
    type: [String],
    required: true,
    validate: {
      validator: (arr) => arr.length > 0,
      message: 'At least one image is required',
    },
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'out_of_stock'],
    default: 'active',
  },
},
{timestamps:true}
);

// Update updatedAt on save
productSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});



const ProductDetails = mongoose.model('ProductDetails', productSchema)

module.exports = ProductDetails