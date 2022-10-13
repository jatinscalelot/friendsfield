var Joi = require('joi');
const create_product = Joi.object().keys({
	name: Joi.string().trim().max(30).required(),
	price: Joi.number().trim().required(),
	description: Joi.string().trim().required(),
	category: Joi.string().trim().required(),
	subCategory: Joi.string().trim().required(),
	offer: Joi.string().allow(null, ""),
	itemCode: Joi.string().trim().required()
});
const update_product = Joi.object().keys({
	name: Joi.string().trim(),
	price: Joi.number().trim(),
	description: Joi.string().trim(),
	category: Joi.string().trim(),
	subCategory: Joi.string().trim(),
	offer: Joi.string().allow(null, ""),
	itemCode: Joi.string().trim()
});
module.exports = { create_product, update_product }