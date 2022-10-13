var Joi = require('joi');
const create_business = Joi.object().keys({
	name: Joi.string().trim(),
	category: Joi.number(),
	subCategory: Joi.string().trim(),
	description: Joi.string().trim(),
	longitude: Joi.number(),
	latitude: Joi.number(),
	interestedCategory: Joi.string().trim(),
	interestedSubCategory: Joi.string().trim()
});
module.exports = { create_business }