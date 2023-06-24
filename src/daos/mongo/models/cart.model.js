const { Schema, model } = require('mongoose')

const collection = 'carts'

const cartSchema = new Schema({
  products: [
    {
      product: {
        type: Schema.Types.ObjectId,
        ref: 'products',
      },
      quantity: Number,
    },
  ],
})

cartSchema.pre('findOne', function () {
  this.populate('products.product')
})

const cartModel = new model(collection, cartSchema)

module.exports = cartModel
