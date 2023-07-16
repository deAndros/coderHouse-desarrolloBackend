const nodemailer = require('nodemailer')
const config = require('../config/object.config')

const transport = nodemailer.createTransport({
  service: 'gmail',
  port: 587,
  auth: {
    user: config.gmail_app_user,
    pass: config.gmail_app_Password,
  },
})

exports.sendEmail = async (receiver, subject, html) => {
  return await transport.sendMail({
    from: 'nightwingsg14@gmail.com',
    to: receiver,
    // subject: 'Correo de prueba comsión 39750',
    subject,
    html,
    // html:`<div>
    //     <h1>Esto es un test</h1>
    // </div>`,
    attachments: [
      /*{
        filename: 'nodejs.png',
        path: __dirname + '/nodejs.png',
        cid: 'nodejs',
      },*/
    ],
  })
}
