var Joi = require('joi');
const create_profile = Joi.object().keys({
	fullName: Joi.string().trim().required(),
	userName: Joi.string().trim().required(),
	nickName: Joi.string().trim().required(),
	emailId: Joi.string().trim().email().required(),
	dob: Joi.date().trim().required(),
	longitude: Joi.number().trim().required(),
	latitude: Joi.number().trim().required(),
	gender: Joi.string().trim().required(),
	interestedin: Joi.string().trim().required(),
	areaRange: Joi.number().trim().required(),
	aboutUs: Joi.string().trim(),
	targetAudienceAgeMin: Joi.number().trim().required(),
	targetAudienceAgeMax: Joi.number().trim().required(),
	hobbies: Joi.array().trim(),
	socialMediaLinks: Joi.array().trim()
});
module.exports = { create_profile }