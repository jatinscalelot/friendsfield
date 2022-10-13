let mongoose = require("mongoose");
let mongoosePaginate = require("mongoose-paginate-v2");
let schema = new mongoose.Schema({
    
}, {timestamps: true, strict: false, autoIndex: true });
schema.plugin(mongoosePaginate);
schema.index({ location: '2dsphere' });
module.exports = schema;