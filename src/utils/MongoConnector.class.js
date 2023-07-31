const { connect } = require('mongoose')

//Singleton
class MongoConnector {
  static #instance
  constructor() {
    connect(process.env.MONGO_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
  }
  static getInstance() {
    if (this.#instance) {
      console.log('La conexión con la base de datos ya está creada')
      return this.#instance
    }
    this.#instance = new MongoConnector()
    console.log('Base de datos conectada')
    return this.#instance
  }
}

module.exports = {
  MongoConnector,
}
