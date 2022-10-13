let mongoose = require("mongoose");
let mongoosePaginate = require("mongoose-paginate-v2");
let schema = new mongoose.Schema({
	conatct_no: {
		type: String,
		require: true
	},
	fullName: {
		type: String,
		default: ''
	},
	userName: {
		type: String,
		default: ''
	},
	nickName: {
		type: String,
		default: ''
	},
	emailId: {
		type: String,
		default: ''
	},
	dob: {
		type: String,
		default: null
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
	gender: {
		type: String,
		default: ''
	},
	interestedin: {
		type: String,
		default: ''
	},
	areaRange: {
		type: Number,
		default: null
	},
	aboutUs: {
		type: String,
		default: ''
	},
	targetAudienceAgeMin: {
		type: Number,
		default: null
	},
	targetAudienceAgeMax: {
		type: Number,
		default: null
	},
	hobbies: [],
	socialMediaLinks: [],
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