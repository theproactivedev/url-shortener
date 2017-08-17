var mongoose = require("mongoose");

var Schema = mongoose.Schema;

var urlSchema = new Schema({
  originalURL: String,
  shortURL: String
}, {timestamps: true});

var ModelClass = mongoose.model("shortURL", urlSchema);

module.exports = ModelClass;