const jwt = require("jsonwebtoken");
const User = require("../models/user");
const { securePassword } = require("../helpers/bcryptPassword");
const dev = require("../config/index");
const sendEmailWithNodeMailer = require("../helpers/email");
const { isEmail } = require("validator");

const register = async (req, res) => {
  try {
    const { name, email, password, phone } = req.fields;
    const { image } = req.files;

    //check if fields are not empty
    if (!name || !email || !password || !phone) {
      return res.status(404).json({
        message: "one or more fields is missing",
      });
    }

    //check if email is valid
    if (!isEmail(email)) {
      return res.status(404).json({
        message: "Please provide a valid email address",
      });
    }

    //check password length
    if (password.length < 6) {
      return res.status(404).json({
        message: "Minimum length for password is less than 6 characters",
      });
    }

    //check if image is added and size is greater 1MB
    if (image && image.size > 1000000) {
      return res.status(404).json({
        message: "Maximum image size is 1MB",
      });
    }

    //check if user already exist
    const userExist = await User.findOne({
      email: email,
    });
    if (userExist) {
      return res.status(400).json({
        message: `User with the ${email} already exist`,
      });
    }

    //hash user password for security
    const hashedPassword = await securePassword(password);

    //create Token to store data
    const token = jwt.sign(
      { name, email, hashedPassword, phone, image },
      dev.app.jwtSecretKey,
      { expiresIn: "10m" }
    );

    // prepare the email: what we want to show in the email
    const emailData = {
      email,
      subject: "Account Activation Email",
      html: `
        <h2>Hello ${name}</h2>
        <p>Please click here to <a href="${dev.app.clientUrl}/api/users/activate${token}" target="_blank">activate your account</a> </p>
        `, // html body
    };

    // send verification email to the user
    sendEmailWithNodeMailer(emailData);

    res.status(201).json({
      message: "A verification link has been sent to your email",
      token: token,
    });
  } catch (error) {
    return res.status(500).json({
      message: error,
    });
  }
};

module.exports = register;
