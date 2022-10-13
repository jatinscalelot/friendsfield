var Joi = require('joi');
const create_profile = Joi.object().keys({
	fullName: Joi.string().trim(),
	userName: Joi.string().trim(),
	nickName: Joi.string().trim(),
	emailId: Joi.string().trim().email(),
	//dob: Joi.date().format('DD/MM/YYYY'),
	longitude: Joi.number(),
	latitude: Joi.number(),
	gender: Joi.string().trim(),
	interestedin: Joi.string().trim(),
	areaRange: Joi.number(),
	aboutUs: Joi.string().trim(),
	targetAudienceAgeMin: Joi.number(),
	targetAudienceAgeMax: Joi.number(),
	hobbies: Joi.array(),
	socialMediaLinks: Joi.array()
});
module.exports = { create_profile }