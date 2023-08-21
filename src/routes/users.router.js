const CustomRouter = require("./customRouter.class.js");
const {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  swapRole,
  deleteUser,
  uploadDocument,
} = require("../controllers/users.controller.js");
const uploader = require("../middlewares/multer.js");

class UsersRouter extends CustomRouter {
  init() {
    this.get("/", ["ADMIN"], getUsers);

    this.get("/:uid([a-zA-Z0-9]+)", ["ADMIN"], getUserById);

    this.post("/", ["ADMIN"], createUser);

    this.post(
      "/:uid([a-zA-Z0-9]+)/documents",
      ["ADMIN", "USER", "PREMIUM"],
      uploader.fields([
        { name: "profileImage", maxCount: 1 },
        { name: "productImage", maxCount: 1 },
        { name: "document", maxCount: 10 },
      ]),
      uploadDocument
    );

    this.put("/:uid([a-zA-Z0-9]+)", ["ADMIN"], updateUser);

    this.put("/premium/:uid([a-zA-Z0-9]+)", ["PUBLIC"], swapRole);

    this.delete("/:uid([a-zA-Z0-9]+)", ["ADMIN"], deleteUser);
  }
}

module.exports = new UsersRouter();
