const { Router } = require('express');
const { auth } = require('../middlewares/authentication.middleware');
const { userModel } = require('../managerDaos/mongo/models/user.model');

const router = Router();

router.post('/login', async (request, response) => {
  try {
    const { eMail, password } = request.body;

    if (!eMail || !password)
      return response.status(400).send({
        status: 'error',
        message:
          'Los campos "Username", "Nombre", "Apellido", "E-Mail" y "Password" son obligatorios',
      });

    const userFromDB = await userModel.findOne({
      email: eMail,
      password: password,
    });

    if (!userFromDB)
      return response.status(401).send({
        status: 'error',
        message: 'El usuario o la contraseña son incorrectos',
      });

    request.session.user = {
      first_name: userFromDB.first_name,
      last_name: userFromDB.last_name,
      eMail: userFromDB.email,
      role: userFromDB.role,
    };

    response.redirect('/products');
  } catch (error) {
    response.status(400).send({ status: 'error', error: error.message });
  }
});

router.get('/logout', async (request, response) => {
  request.session.destroy((error) => {
    if (error) {
      return response.send({ status: 'error', error: error.message });
    }
    response.redirect('/login');
  });
});

router.post('/register', async (request, response) => {
  try {
    const { userName, firstName, lastName, eMail, password } = request.body;

    let isAdmin = request.body.isAdmin;

    if (!userName || !firstName || !lastName || !eMail || !password)
      return response.status(400).send({
        status: 'error',
        message:
          'Los campos "Username", "Nombre", "Apellido", "E-Mail" y "Password" son obligatorios',
      });

    const userNameExists = await userModel.findOne({
      user_name: userName.toUpperCase(),
    });
    const eMailExists = await userModel.findOne({ email: eMail });

    //Preguntar por qué no responde con el mensaje de error
    if (userNameExists)
      return response.status(400).send({
        status: 'error',
        message: 'El ID de usuario ingresado ya existe',
      });

    if (eMailExists)
      return response.status(400).send({
        status: 'error',
        message: 'Ya existe un usuario con el e-mail ingresado',
      });

    isAdmin === 'on' ? (isAdmin = 'Admin') : (isAdmin = 'Client');

    const userData = {
      user_name: userName.toUpperCase(),
      first_name: firstName,
      last_name: lastName,
      email: eMail,
      password: password,
      role: isAdmin,
    };

    let newUser = await userModel.create(userData);
    console.log('newUser ', newUser);
    response.status(200).send({
      status: 'success',
      message: 'Usuario registrado exitosamente',
    });
  } catch (error) {
    response.status(400).send({ status: 'error', error: error.message });
  }
});

router.get('/privada', auth, (request, response) => {
  response.send('Todo lo que esta acá solo lo puede ver un admin loagueado');
});

router.get('/counter', (request, response) => {
  if (request.session.counter) {
    request.session.counter++;
    response.send(`se ha visitado el sitio ${req.session.counter} veces.`);
  } else {
    request.session.counter = 1;
    response.send('Bienvenido');
  }
});

isValidString = (string, pattern) => {
  //Patrones REGEX, se instancian con sugar syntax solo poniéndolos entre /patron/
  const firstLastNamePattern = '/^[a-zA-Z0-9sáéíóúÁÉÍÓÚ]+$/';
  const eMailPattern = '/^[^s@]+@[^s@]+.[^s@]+$/';
  const userNamePattern = '/^[a-zA-Z0-9]+$/';

  if (pattern === 'firstName' || pattern === 'lastName') {
    pattern = firstLastNamePattern;
  } else if (pattern === 'eMail') {
    pattern = eMailPattern;
  } else if (pattern === 'userName') {
    pattern === userNamePattern;
  } else {
    throw new Error('El patrón ingresado es incorrecto');
  }

  //Verifico si la cadena coincide con el patrón
  pattern.test(string) ? true : false;
};

module.exports = router;
