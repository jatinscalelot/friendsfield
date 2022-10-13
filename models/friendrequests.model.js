let mongoose = require("mongoose");
let mongoosePaginate = require("mongoose-paginate-v2");
let schema = new mongoose.Schema({
	senderid: {
		type: mongoose.Types.ObjectId,
		require: true
	},
	receiverid: {
		type: mongoose.Types.ObjectId,
		require: true
	},
	message: {
		type: String,
		default: ''
	},
	status: {
		type: String,
		default: 'sent'
	},
	createdBy: {
		type: mongoose.Types.ObjectId,
		default: null
	},
	updatedBy: {
		type: mongoose.Types.ObjectId,
		default: null
	}
}, { timestamps: true, strict: false, autoIndex: true });
schema.plugin(mongoosePaginate);
module.exports = schema;