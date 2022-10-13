let mongoose = require("mongoose");
let mongoosePaginate = require("mongoose-paginate-v2");
let schema = new mongoose.Schema({
	name: {
		type: String,
		require: true
	},
	price: {
		type: Number,
		default: '',
		require: true
	},
	description: {
		type: String,
		default: ''
	},
	category: {
		type: String,
		default: ''
	},
	subCategory: {
		type: String,
		default: ''
	},
	offer: {
		type: String,
		default: ''
	},
	itemCode: {
		type: String,
		default: ''
	},
	userid: {
		type: mongoose.Types.ObjectId,
		require: true
	},
	businessid: {
		type: mongoose.Types.ObjectId,
		require: true
	},
	images: [],
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