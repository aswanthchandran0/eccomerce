const Joi = require('joi');

const bannerValidator = Joi.object({
image: Joi.string()
  .pattern(/^\/uploads\/banners\/[A-Za-z0-9._-]+\.(jpg|jpeg|png|gif)$/i)
  .required()
  .messages({
    "string.empty": "Banner image is required",
    "string.pattern.base": "Image must be a valid URL or local path with .jpg, .jpeg, .png, or .gif"
  }),

  eyebrowText: Joi.string()
    .trim()
    .min(2)
    .max(50)
    .pattern(/^[\w\s&-]+$/)
    .required()
    .messages({
      "string.empty": "Eyebrow text is required",
      "string.min": "Eyebrow text must be at least 2 characters",
      "string.max": "Eyebrow text cannot exceed 50 characters",
      "string.pattern.base": "Eyebrow text can only contain letters, numbers, spaces, &, or -"
    }),

  headline: Joi.string()
    .trim()
    .min(2)
    .max(100)
    .pattern(/^[\w\s&-]+$/)
    .required()
    .messages({
      "string.empty": "Headline is required",
      "string.min": "Headline must be at least 2 characters",
      "string.max": "Headline cannot exceed 100 characters",
      "string.pattern.base": "Headline can only contain letters, numbers, spaces, &, or -"
    }),

  subHeadline: Joi.string()
    .trim()
    .min(2)
    .max(150)
    .pattern(/^[\w\s.,!&-]*$/)
    .required()
    .messages({
      "string.empty": "Sub-headline is required",
      "string.min": "Sub-headline must be at least 2 characters",
      "string.max": "Sub-headline cannot exceed 150 characters",
      "string.pattern.base": "Sub-headline can only contain letters, numbers, spaces, and common punctuation"
    }),

  callToAction: Joi.string()
    .trim()
    .min(2)
    .max(50)
    .pattern(/^[\w\s&-]+$/)
    .required()
    .messages({
      "string.empty": "Call to action is required",
      "string.min": "Call to action must be at least 2 characters",
      "string.max": "Call to action cannot exceed 50 characters",
      "string.pattern.base": "Call to action can only contain letters, numbers, spaces, &, or -"
    }),

  url: Joi.string()
    .pattern(/^\/|https?:\/\//)
    .required()
    .messages({
      "string.empty": "Link URL is required",
      "string.pattern.base": "Invalid link URL"
    }),
});

module.exports = bannerValidator;
