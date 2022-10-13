var Joi = require('joi');
const create_profile = Joi.object().keys({
	fullName: Joi.string().trim(),
	userName: Joi.string().trim(),
	nickName: Joi.string().trim(),
	emailId: Joi.string().trim().email(),
	dob: Joi.date().trim(),
	longitude: Joi.number().trim(),
	latitude: Joi.number().trim(),
	gender: Joi.string().trim(),
	interestedin: Joi.string().trim(),
	areaRange: Joi.number().trim(),
	aboutUs: Joi.string().trim(),
	targetAudienceAgeMin: Joi.number().trim(),
	targetAudienceAgeMax: Joi.number().trim(),
	hobbies: Joi.array(),
	socialMediaLinks: Joi.array()
});
module.exports = { create_profile }