const jwt = require("jsonwebtoken");
const fs = require("fs");
const User = require("../models/user");
const {
  securePassword,
  comparePassword,
} = require("../helpers/bcryptPassword");
const dev = require("../config/index");
const sendEmailWithNodeMailer = require("../helpers/email");
const { isEmail } = require("validator");

//Login User
const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // check if fields are missing
    if (!email || !password) {
      return res.status(404).json({
        message: "email or password is incorrect",
      });
    }

    // check password length
    if (password.length < 6) {
      return res.status(404).json({
        message: "Minimum length for password is 6 characters",
      });
    }

    // check if user with admin rights already exist by email
    const user = await User.findOne({ email: email });
    if (!user) {
      return res.status(400).json({
        message: "User with this email does not exist. Please register.",
      });
    }

    //Check if user is an Admin
    if (!user.is_admin) {
      return res.status(400).json({
        message: "Login unsuccessful, user is not an admin",
      });
    }

    // compare password
    const isPasswordMatched = await comparePassword(password, user.password);
    if (!isPasswordMatched) {
      return res.status(400).json({
        message: "email/password mismatched",
      });
    }

    // creating a session -> browser as a cookie
    req.session.userId = user._id;
    console.log(req.session);

    res.status(200).json({
      message: "Login successful Admin",
      user: {
        name: user.name,
        email: user.email,
        phone: user.phone,
        image: user.image,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const logoutAdmin = (req, res) => {
  try {
    //destroy cookies when user logs out, the user isn't logged in anymore
    req.session.destroy();
    //clear the cookies and pass the session
    res.clearCookie("admin_session");
    res.status(201).json({
      ok: true,
      message: "Log out successful",
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      message: error.message,
    });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({ is_admin: 0 });

    res.status(201).json({
      ok: true,
      message: "returned all users",
      users: users,
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      message: error.message,
    });
  }
};

//admin-profile, reset password, forget password, dashboard -- CRUD --create user, read all users except admin

module.exports = { loginAdmin, logoutAdmin, getAllUsers };
