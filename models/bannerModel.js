const mongoose = require('mongoose');

const bannerSchema = new mongoose.Schema({
  image: {
    type: String,
    required: [true, 'Banner image is required'],
    match: [/^\/uploads\/banners\/|https?:\/\//, 'Invalid image URL']
  },
  eyebrowText: {
    type: String,
    required: [true, 'Eyebrow text is required'],
    trim: true,
    minlength: [2, 'Eyebrow text must be at least 2 characters'],
    maxlength: [50, 'Eyebrow text cannot exceed 50 characters'],
    match: [/^[\w\s&-]+$/, 'Eyebrow text can only contain letters, numbers, spaces, &, or -']
  },
  headline: {
    type: String,
    required: [true, 'Headline is required'],
    trim: true,
    minlength: [2, 'Headline must be at least 2 characters'],
    maxlength: [100, 'Headline cannot exceed 100 characters'],
    match: [/^[\w\s&-]+$/, 'Headline can only contain letters, numbers, spaces, &, or -']
  },
  subHeadline: {
    type: String,
    required: [true, 'Sub-headline is required'],
    trim: true,
    minlength: [2, 'Sub-headline must be at least 2 characters'],
    maxlength: [150, 'Sub-headline cannot exceed 150 characters'],
    match: [/^[\w\s.,!&-]*$/, 'Sub-headline can only contain letters, numbers, spaces, and common punctuation']
  },
  callToAction: {
    type: String,
    required: [true, 'Call to action is required'],
    trim: true,
    minlength: [2, 'Call to action must be at least 2 characters'],
    maxlength: [50, 'Call to action cannot exceed 50 characters'],
    match: [/^[\w\s&-]+$/, 'Call to action can only contain letters, numbers, spaces, &, or -']
  },
  url: {
    type: String,
    required: [true, 'Link URL is required'],
    match: [/^\/|https?:\/\//, 'Invalid link URL']
  },
}, {
  timestamps: true
});

const Banner = mongoose.model('banners', bannerSchema);

module.exports = Banner;