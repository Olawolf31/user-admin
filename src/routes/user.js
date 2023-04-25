const userRoutes = require("express").Router();
const session = require("express-session");
const dev = require("../config/index");
const upload = require("../middleware/fileUpload");

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
  resetPassword,
} = require("../controllers/userLogic");

//user session
userRoutes.use(
  session({
    name: "user_session",
    secret: dev.app.sessionSecretKey,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false, maxAge: 10 * 6000 },
  })
);

//routes
userRoutes.post("/register", upload.single("image"), register);
userRoutes.post("/verify-email/", verifyEmail);
userRoutes.post("/login", isLoggedOut, loginUser);
userRoutes.get("/logout", logOutUser);

//routes chaining
userRoutes
  .route("/")
  .get(isLoggedIn, userProfile)
  .delete(isLoggedIn, deleteUser)
  .put(isLoggedIn, upload.single("image"), updateUser);

userRoutes.post("/forget-password", isLoggedOut, forgetPassword);
userRoutes.post("/reset-password", isLoggedOut, resetPassword);

module.exports = userRoutes;
