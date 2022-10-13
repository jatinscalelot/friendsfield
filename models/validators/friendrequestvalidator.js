var Joi = require('joi');
const create_notification = Joi.object().keys({
	senderid: Joi.string().trim().required(),
	receiverid: Joi.string().trim().required(),
	message: Joi.string().trim().required(),
	status: Joi.string().trim().required(),
});
module.exports = { create_notification }