const Joi = require("joi");

module.exports.listingSchema = Joi.object({
    listing: Joi.object({
        title: Joi.string().trim().required(),
        description: Joi.string().trim().required(),
        location: Joi.string().trim().required(),
        country: Joi.string().trim().required(),
        price: Joi.number().integer().min(0).required(),
        image: Joi.object({
            url: Joi.string().trim().allow("", null),
            filename: Joi.string().trim().allow("", null),
        }).default({}),
    }).required(),
});
