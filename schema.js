//joi is use for server side all informaiton is work  systematically

const Joi = require("joi");

module.exports.listingSchema = Joi.object({              //syntex
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




module.exports.reviewSchema = Joi.object({
    review: Joi.object({
        rating: Joi.number().required().min(1).max(5),
        comment: Joi.string().required(),   // ✅ FIXED
    }).required()
});