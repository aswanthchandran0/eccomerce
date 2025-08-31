const mongoose = require('mongoose')

const catagorySchema = new mongoose.Schema({
  name:{
    type:String,
    required: [true, 'Category name is required'],
    unique: true,
    trim: true,
    maxlength: [100, 'Category name cannot exceed 100 characters'],
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
})

const catagory = mongoose.model('catagory',catagorySchema)

module.exports = catagory; 