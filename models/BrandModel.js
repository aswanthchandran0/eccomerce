const mongoose = require('mongoose')

const BrandSchema = mongoose.Schema({
    name:{
    type:String,
    required: [true, 'Brand name is required'],
    unique: true,
    trim: true,
    maxlength: [100, 'Brand name cannot exceed 100 characters'],
    },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters'],
    default: ''
  },
  is_active: {
    type: Boolean,
    default: true
  },
}, {
  timestamps: true // Adds createdAt, updatedAt
});


const Brand = mongoose.model('Brand',BrandSchema)
module.exports = Brand