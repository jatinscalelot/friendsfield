var Joi = require('joi');
const create_product = Joi.object().keys({
	name: Joi.string().trim().max(30).required(),
	price: Joi.number().required(),
	description: Joi.string().trim().required(),
	category: Joi.string().trim().required(),
	subCategory: Joi.string().trim().required(),
	offer: Joi.string().allow(null, ""),
	itemCode: Joi.string().trim().required(),
	images: Joi.array()
});
const update_product = Joi.object().keys({
	name: Joi.string().trim(),
	price: Joi.number(),
	description: Joi.string().trim(),
	category: Joi.string().trim(),
	subCategory: Joi.string().trim(),
	offer: Joi.string().allow(null, ""),
	itemCode: Joi.string().trim(),
	images: Joi.array()
});
module.exports = { create_product, update_product }