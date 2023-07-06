const { v4: uuidv4 } = require('uuid')

const { Schema, model } = require('mongoose')

const collection = 'tickets'

const ticketSchema = new Schema({
  code: { type: String, default: uuidv4() },
  purchase_datetime: { type: Date, default: Date.now() },
  amount: { type: Number, required: true },
  purchaser: { type: String, required: true },
  purchasedProducts: { type: Array, required: true },
})

/*cartSchema.pre('findOne', function () {
  this.populate('products.product')
})*/

const ticketModel = new model(collection, ticketSchema)

module.exports = ticketModel
