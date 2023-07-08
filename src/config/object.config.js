const dotenv = require('dotenv')
const commander = require('../utils/commander')
const { MongoConnector } = require('../utils/MongoConnector.class')
const { mode } = commander.opts()

dotenv.config({
  path: mode === 'development' ? './.env.development' : './.env.production',
})

//TODO: Pasar el resto de los parámetros seteados en mi .env a los demás archivos que los utilizan. Ahora solo estoy pasando el puerto.
module.exports = {
  persistance: process.env.PERSISTANCE,
  PORT: process.env.PORT,
  gmailAppUser: process.env.GMAIL_APP_USER,
  gmailAppPassword: process.env.GMAIL_APP_PASSWORD,
  connectDB: async () => {
    try {
      MongoConnector.getInstance()
    } catch (error) {
      throw new Error(error.message)
    }
  },
}
