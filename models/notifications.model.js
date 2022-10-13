let mongoose = require("mongoose");
let mongoosePaginate = require("mongoose-paginate-v2");
let schema = new mongoose.Schema({
	title: {
		type: String,
		require: true
	},
	description: {
		type: String,
		default: null
	},
	link: {
		type: String,
		default: ''
	},
	category: {
		type: String,
		default: ''
	},
	imageUrl: {
		type: String,
		default: ''
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