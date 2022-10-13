var Joi = require('joi');
const create_business = Joi.object().keys({
	name: Joi.string().trim().required(),
	category: Joi.number().trim().required(),
	subCategory: Joi.string().trim().required(),
	description: Joi.string().trim().required(),
	longitude: Joi.number().trim().required(),
	latitude: Joi.number().trim().required(),
	interestedCategory: Joi.string().trim().required(),
	interestedSubCategory: Joi.string().trim().required(),
	itemCode: Joi.string().trim().required()
});
module.exports = { create_business }