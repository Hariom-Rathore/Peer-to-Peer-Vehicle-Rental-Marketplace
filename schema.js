//joi is use for server side all informaiton is work  systematically

const Joi = require("joi");

module.exports.listingSchema = Joi.object({              //syntex
    listing: Joi.object({
        title: Joi.string().trim().required(),
        description: Joi.string().trim().required(),
        location: Joi.string().trim().required(),
        country: Joi.string().trim().required(),
        price: Joi.number().integer().min(0).required(),
        ratePerKm: Joi.number().min(0).optional(),
        whatsappNumber: Joi.string().trim().min(8).max(20).required(),
        carType: Joi.string().trim().valid("electric", "petrol", "diesel", "hybrid", "other").optional(),
        seats: Joi.number().valid(4, 6, 10).optional(),
        category: Joi.string().trim().optional(),
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