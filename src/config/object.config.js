const dotenv = require('dotenv')
const commander = require('../utils/commander')
const { MongoConnector } = require('../utils/MongoConnector.class')
const { mode } = commander.opts()

dotenv.config({
  path: mode === 'development' ? './.env.development' : './.env.production',
})

//TODO: Pasar el resto de los parámetros seteados en mi .env a los demás archivos que los utilizan. Ahora solo estoy pasando el puerto.
module.exports = {
  app_mode: mode,
  persistance: process.env.PERSISTANCE,
  PORT: process.env.PORT,
  gmail_app_user: process.env.GMAIL_APP_USER,
  gmail_app_Password: process.env.GMAIL_APP_PASSWORD,
  twilio_sid: process.env.TWILIO_SID,
  twilio_auth_token: process.env.TWILIO_AUTH_TOKEN,
  twilio_phone_number: process.env.TWILIO_PHONE,
  twilio_whatsapp: process.env.TWILIO_WHATSAPP,
  my_phone: process.env.MY_PHONE,
  connectDB: async () => {
    try {
      MongoConnector.getInstance()
    } catch (error) {
      throw new Error(error.message)
    }
  },
}
