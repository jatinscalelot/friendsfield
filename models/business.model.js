let mongoose = require("mongoose");
let mongoosePaginate = require("mongoose-paginate-v2");
let schema = new mongoose.Schema({
	name: {
		type: String,
		require: true
	},
	category: {
		type: String,
		default: '',
		require: true
	},
	subCategory: {
		type: String,
		default: ''
	},
	description: {
		type: String,
		default: ''
	},
	location: {
		type: {
			type: String,
			enum: ['Point']
		},
		coordinates: {
			type: [Number]
		}
	},
	interestedCategory: {
		type: String,
		default: ''
	},
	interestedSubCategory: {
		type: String,
		default: ''
	},
	userid: {
		type: mongoose.Types.ObjectId,
		require: true
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
schema.index({ location: '2dsphere' });
module.exports = schema;