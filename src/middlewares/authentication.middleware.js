function auth(request, response, next) {
  console.log('user', request.session);
  if (!request.session.user || !(request.session?.user?.role === 'Admin')) {
    return response.status(401).send('Error de autenticación');
  }
  next();
}

module.exports = {
  auth,
};
