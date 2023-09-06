const multer = require('multer')
const path = require('path')
const fs = require('fs')

const storage = multer.diskStorage({
  destination: function (request, file, callback) {
    let folder = ''

    if (file.fieldname === 'profileImage') {
      folder = 'profiles'
    } else if (file.fieldname === 'productImage') {
      folder = 'products'
    } else if (file.fieldname === 'document') {
      folder = 'documents'
    }

    const userFolder = path.join(
      __dirname,
      '..',
      'uploads',
      folder,
      request.user.email
    )

    // Crear la carpeta del usuario si no existe
    if (!fs.existsSync(userFolder)) {
      fs.mkdirSync(userFolder, { recursive: true })
    }

    callback(null, userFolder)
  },
  filename: function (request, file, callback) {
    callback(null, Date.now() + '-' + file.originalname)
  },
})

const uploader = multer({
  storage,
  onError: (error, next) => {
    next(error)
  },
})

module.exports = uploader
