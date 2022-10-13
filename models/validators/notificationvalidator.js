var Joi = require('joi');
const create_notification = Joi.object().keys({
	title: Joi.string().trim().required(),
	description: Joi.string().trim().required(),
	link: Joi.string().trim().required(),
	category: Joi.string().trim().required(),
	imageUrl: Joi.string().trim().required(),
});
module.exports = { create_notification }