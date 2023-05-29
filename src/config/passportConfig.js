const passport = require('passport');
const passportLocal = require('passport-local');
const { userModel } = require('../managerDaos/mongo/models/user.model');
const { createHash, isValidPassword } = require('../utils/bcryptHash');
const GithubStrategy = require('passport-github2');
require('dotenv').config();

const LocalStrategy = passportLocal.Strategy;

//Función que va a inicializar mis middlewares de passport
const initPassport = () => {
  passport.use(
    'register',
    new LocalStrategy(
      { passReqToCallback: true, usernameField: 'eMail' },
      async (request, username, password, done) => {
        try {
          //No me traigo el eMail porque ya viene en el "username" que recibe por parámetro esta callback
          const { userName, firstName, lastName } = request.body;
          let isAdmin = request.body.isAdmin;

          if (!userName || !firstName || !lastName || !username || !password)
            return done(
              'Los campos "Username", "Nombre", "Apellido", "E-Mail" y "Password" son obligatorios',
              false
            );

          //TODO: Busco dos veces en la base. Una por usuario y una por eMail para poder tener una validación discriminada de c/u. Revisar maneras de mejorar.
          const userNameExists = await userModel.findOne({
            user_name: userName.toUpperCase(),
          });
          const eMailExists = await userModel.findOne({ email: username });

          //TODO: Preguntar por que no devolvemos un error en el primer parámetro de done
          if (userNameExists) return done(null, false);

          if (eMailExists) return done(null, false);

          isAdmin === 'on' ? (isAdmin = 'Admin') : (isAdmin = 'Client');

          const userData = {
            user_name: userName.toUpperCase(),
            first_name: firstName,
            last_name: lastName,
            email: username,
            password: createHash(password),
            role: isAdmin,
          };

          let newUser = await userModel.create(userData);
          return done(null, newUser);
        } catch (error) {
          return done('Se produjo un error: ' + error.message, false);
        }
      }
    )
  );

  passport.use(
    'login',
    new LocalStrategy(
      { usernameField: 'eMail' },
      async (username, password, done) => {
        try {
          if (!username || !password)
            return done('El e-mail y la constraseña son obligatiorios', false);

          const userFromDB = await userModel.findOne({
            email: username,
          });

          //TODO: Preguntar por qué no retorno un error en el done
          if (!userFromDB) return done(null, false);

          if (!isValidPassword(password, userFromDB)) return done(null, false);

          return done(null, userFromDB);
        } catch (error) {
          return done(
            'Se produjo un error al obtener el usuario: ' + error.message,
            false
          );
        }
      }
    )
  );

  //Guarda el ID del usuario en mi objeto de sesión
  passport.serializeUser((user, done) => {
    done(null, user._id);
  });

  //Busca el ID del usuario que está en mi objeto de sesión en la base de datos
  passport.deserializeUser(async (user, done) => {
    let deserializedUser = await userModel.findOne({ _id: user.id });
    done(null, deserializedUser);
  });
};

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
          let user = await userModel.findOne({ email: profile._json.email });

          //Si no existe el usuario, lo registro y lo creo en mi DB
          if (!user) {
            let userData = {
              user_name: profile.username,
              first_name: profile.username,
              last_name: profile.username,
              email: profile._json.email,
              password: '-',
              role: 'Admin', //TODO: Modificar esto, solo está así para que el usuario que se registre pueda ver la ruta de productos
            };

            let newUser = await userModel.create(userData);
            return done(null, newUser);
          }

          //Si existe, lo retorno
          return done(null, user);
        } catch (error) {
          console.log(error.message);
        }
      }
    )
  );

  //Guarda el ID del usuario en mi objeto de sesión
  passport.serializeUser((user, done) => {
    done(null, user._id);
  });

  //Busca el ID del usuario que está en mi objeto de sesión en la base de datos
  passport.deserializeUser(async (user, done) => {
    let deserializedUser = await userModel.findOne({ _id: user.id });
    done(null, deserializedUser);
  });
};

module.exports = { initPassport, initPassportGithub };
