var Joi = require('joi');
const create_business = Joi.object().keys({
	name: Joi.string().trim(),
	category: Joi.number().trim(),
	subCategory: Joi.string().trim(),
	description: Joi.string().trim(),
	longitude: Joi.number().trim(),
	latitude: Joi.number().trim(),
	interestedCategory: Joi.string().trim(),
	interestedSubCategory: Joi.string().trim()
});
module.exports = { create_business }