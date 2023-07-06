const CustomRouter = require('./customRouter.class.js')
const {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
} = require('../controllers/users.controller.js')

class UsersRouter extends CustomRouter {
  init() {
    this.get('/', ['ADMIN'], getUsers)

    this.get('/:uid([a-zA-Z0-9]+)', ['ADMIN'], getUserById)

    this.post('/', ['ADMIN'], createUser)

    this.put('/:uid([a-zA-Z0-9]+)', ['ADMIN'], updateUser)

    this.delete('/:uid([a-zA-Z0-9]+)', ['ADMIN'], deleteUser)
  }
}

module.exports = new UsersRouter()
