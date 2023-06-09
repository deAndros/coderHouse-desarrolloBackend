const passport = require('passport')
const { userModel } = require('../managerDaos/mongo/models/user.model')
const GithubStrategy = require('passport-github2')
const { Strategy, ExtractJwt } = require('passport-jwt')
const { generateToken } = require('../utils/jwt')

const JWTStrategy = Strategy
const JWTExtractor = ExtractJwt

require('dotenv').config()

let cookieExtractor = (request) => {
  let accessToken = null

  if (request && request.cookies) {
    accessToken = request.cookies['accessToken']
  }

  return accessToken
}

//PASSPORT CON JWT
const initPassport = () => {
  passport.use(
    'jwt',
    new JWTStrategy(
      {
        jwtFromRequest: JWTExtractor.fromExtractors([cookieExtractor]),
        secretOrKey: process.env.JWT_PRIVATE_KEY,
      },
      async (jwtPayload, done) => {
        try {
          done(null, jwtPayload)
        } catch (error) {
          return done(error)
        }
      }
    )
  )
}

const initPassportGithub = () => {
  passport.use(
    'githublogin',
    new GithubStrategy(
      {
        clientID: process.env.GITHUB_CLIENT_ID,
        clientSecret: process.env.GITHUB_CLIENT_SECRET,
        callbackURL: process.env.GITHUB_CALLBACK_URL,
      },

      async (accessToken, refreshToken, profile, done) => {
        try {
          let user = await userModel.findOne({ email: profile._json.email })

          //Si no existe el usuario, lo registro y lo creo en mi DB
          if (!user) {
            let userData = {
              first_name: profile.name.split(' ')[0],
              last_name: profile.name.split(' ')[1]
                ? profile.name.split(' ')[1]
                : profile.name.split(' ')[0],
              email: profile._json.email,
              password: '-',
              role: 'Admin', //TODO: Modificar esto, solo está así para que el usuario que se registre pueda ver la ruta de productos
            }
            console.log(userData)
            let newUser = await userModel.create(userData)
            const {
              _id,
              password: dbPassword,
              __v,
              ...userMetadata
            } = newUser.toObject()

            const accessToken = generateToken(userMetadata)

            return done(null, accessToken)
          }

          const accessToken = generateToken(user)

          //Si existe, lo retorno
          return done(null, accessToken)
        } catch (error) {
          console.log(error.message)
          return done(error)
        }
      }
    )
  )

  //Guarda el ID del usuario en mi objeto de sesión
  passport.serializeUser((user, done) => {
    done(null, user._id)
  })

  //Busca el ID del usuario que está en mi objeto de sesión en la base de datos
  passport.deserializeUser(async (user, done) => {
    let deserializedUser = await userModel.findOne({ _id: user.id })
    done(null, deserializedUser)
  })
}

module.exports = { initPassport, initPassportGithub }
