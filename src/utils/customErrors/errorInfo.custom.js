exports.generateUserErrorInfo = (user, action) => {
  let info = `One or more properties were incomplete or not valid.`;
  switch (action) {
    case "login":
      info += `\n  * email: needs to be String, received ${user.email}`;
      if (!user.password)
        info += "\n  * password: needs to be String but was not provided";
      break;
    case "restorePassword":
      info += `\n  * email: needs to be String, received ${user.email}`;
      if (!user.password)
        info += "\n  * password: needs to be String but was not provided";
      break;
    case "register":
      info += `\n  * email: needs to be String, received ${user.email}\n  * firstName: needs to be String, received ${user.firstName}\n  * lastName: needs to be String, received ${user.lastName}`;
      break;
    default:
      break;
  }
  return info;
};

exports.generatePoductErrorInfo = (product) => {
  return `One or more properties were incomplete or not valid.
        listado de requirimientos de propiedades del user:
        * first_name: needs to a String, received ${user.title}
        * last_name: needs to a String, received ${user.price}
        * email: needs to a String, received ${user.category}`;
};
