const adminRoutes = require("express").Router();
const session = require("express-session");
const dev = require("../config/index");

//import validation middlewares
const { isLoggedIn, isLoggedOut } = require("../middleware/auth");
const isAdmin = require("../middleware/isAdmin")

const {
  loginAdmin,
  logoutAdmin,
  getAllUsers,
  deleteUserByAdmin,
  updateUserByAdmin,
  exportUsers
} = require("../controllers/adminLogic");

//admin session
adminRoutes.use(
  session({
    name: "admin_session",
    secret: dev.app.sessionSecretKey,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false, maxAge: 10 * 6000 },
  })
);

//routes
adminRoutes.post("/login", isLoggedOut, loginAdmin);
adminRoutes.get("/logout", isLoggedIn, logoutAdmin);
adminRoutes.get("/dashboard", isLoggedIn, getAllUsers);
adminRoutes.delete("/dashboard/:id", isAdmin, deleteUserByAdmin);
adminRoutes.put("/dashboard/:id", isAdmin, updateUserByAdmin)

//export user data in excel
adminRoutes.get("/dashboard/export-excel-data", exportUsers)
module.exports = adminRoutes;
