let mongoose = require("mongoose");
let mongoosePaginate = require("mongoose-paginate-v2");
let schema = new mongoose.Schema({
    from : {
        type: mongoose.Types.ObjectId,
		require: true
    },
    to : {
        type: mongoose.Types.ObjectId,
		require: true
    },
    context : {
        type: mongoose.Types.ObjectId,
		require: true
    },
    contentType : {
        type: String,
		require: true
    }
}, { timestamps: true, strict: false, autoIndex: true });
schema.plugin(mongoosePaginate);
module.exports = schema;