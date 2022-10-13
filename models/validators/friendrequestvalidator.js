var Joi = require('joi');
const create_friendrequest = Joi.object().keys({
	senderid: Joi.string().trim().required(),
	receiverid: Joi.string().trim().required(),
	message: Joi.string().trim().required(),
	status: Joi.string().trim().required(),
});
module.exports = { create_friendrequest }