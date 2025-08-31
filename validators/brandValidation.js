const Joi = require('joi')


const brandValidator = Joi.object({
  name: Joi.string()
    .pattern(/^(?![\d&-])[A-Za-z0-9&\-\s]{2,100}$/)
    .required()
    .messages({
      "string.pattern.base":
        "Brand name must be 2–100 characters, can only include letters, numbers, spaces, '&', '-', and cannot start with a number or special character.",
      "string.empty": "Brand name is required."
    }),
  description: Joi.string().max(500).allow("")
});

module.exports = brandValidator