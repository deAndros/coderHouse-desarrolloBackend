const twilio = require('twilio')
const {
  twilio_sid,
  twilio_auth_token,
  twilio_phone_number,
  twilio_whatsapp,
  my_phone,
} = require('../config/object.config')

const client = twilio(twilio_sid, twilio_auth_token)

exports.sendSms = async (receiver) =>
  client.messages.create({
    body: `Gracias por tu compra ${receiver}`,
    from: twilio_phone_number,
    to: my_phone,
  })

//TODO: Ver por qué no llegan los wsapp
exports.sendWhatsapp = async (receiver) =>
  client.messages.create({
    body: `Gracias por tu compra ${receiver}`,
    from: `whatsapp:${twilio_whatsapp}`,
    to: `whatsapp:${my_phone}`,
  })
