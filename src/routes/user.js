const routes = require("express").Router();
const formidableMiddleware = require("express-formidable");
const session = require("express-session");
const dev = require("../config/index");

//import validation middlewares
const { isLoggedIn, isLoggedOut } = require("../middleware/auth");

const {
  register,
  verifyEmail,
  loginUser,
  logOutUser,
  userProfile,
  deleteUser,
  updateUser,
  forgetPassword,
  resetPassword
} = require("../controllers/userLogic");

//user session
routes.use(
  session({
    name: "user_session",
    secret: dev.app.sessionSecretKey,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false, maxAge: 10 * 6000 },
  })
);

//routes
routes.post("/register", formidableMiddleware(), register);
routes.post("/verify-email/", verifyEmail);
routes.post("/login", isLoggedOut, loginUser);
routes.get("/logout", logOutUser);
routes.get("/", isLoggedIn, userProfile);
routes.delete("/", isLoggedIn, deleteUser);
routes.put("/", isLoggedIn, formidableMiddleware(), updateUser);
routes.post("/forget-password", forgetPassword);
routes.post("/reset-password", resetPassword);

module.exports = routes;
