var Joi = require('joi');
const create_notification = Joi.object().keys({
	title: Joi.string().trim().required(),
	description: Joi.string().trim().required(),
	link: Joi.string().trim().required(),
	imageUrl: Joi.string().trim().required(),
});
const update_notification = Joi.object().keys({
	title: Joi.string().trim(),
	description: Joi.string().trim(),
	link: Joi.string().trim(),
	imageUrl: Joi.string().trim(),
});
module.exports = { create_notification, update_notification }