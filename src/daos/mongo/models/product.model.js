//Product Schema & model
const { Schema, model } = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

const collection = 'products';

const productSchema = new Schema({
  title: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  code: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  description: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  stock: {
    type: Number,
    default: 1,
  },
  status: {
    type: Boolean,
    default: true,
  },
  thumbnails: {
    type: [String],
    default: [],
  },
});

productSchema.plugin(mongoosePaginate);
const productModel = new model(collection, productSchema);

module.exports = { productModel, productSchema };
