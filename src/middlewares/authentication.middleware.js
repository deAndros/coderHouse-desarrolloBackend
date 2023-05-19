function auth(request, response, next) {
  console.log('user', request.session.user.role);
  console.log(!(request.session.user.role === 'Admin'));
  if (!(request.session.user.role === 'Admin')) {
    console.log('ENTRE');
    return response.status(401).send('Error de autenticación');
  }
  console.log('NO ENTRE');
  next();
}

module.exports = {
  auth,
};
