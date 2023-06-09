const jwt = require("jsonwebtoken");
const User = require("../models/user");
const {
  securePassword,
  comparePassword,
} = require("../helpers/bcryptPassword");
const dev = require("../config/index");
const sendEmailWithNodeMailer = require("../helpers/email");
const { isEmail } = require("validator");

const register = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;
    /*  const { image } = req.files; */
    //using express formidable, we use req.files
    const image = req.file && req.file.path;

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

    //check if image is added and size is greater 1MB - using express formidable
    /*     if (image && image.size > 1000000) {
      return res.status(404).json({
        message: "Maximum image size is 1MB",
      });
    } */

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

const verifyEmail = async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) {
      return res.status(404).json({
        message: "token is missing",
      });
    }

    // first verify user token
    jwt.verify(token, dev.app.jwtSecretKey, async function (err, decoded) {
      if (err) {
        return res.status(401).json({
          message: "Token is expired",
        });
      }
      // decoded the user data
      const { name, email, hashedPassword, phone, image } = decoded;
      // check if user already exist by id
      const isExist = await User.findOne({ email: email });
      if (isExist) {
        return res.status(400).json({
          message: "User with this email already exist",
        });
      }

      // create the user
      const newUser = new User({
        name: name,
        email: email,
        password: hashedPassword,
        phone: phone,
        is_verified: 1,
        image,
      });

      //check if image is true
      /*       if (image) {
        newUser.image.contentType = image.type;
        newUser.image.data = fs.readFileSync(image.path);
      } */

      // save the user
      const user = await newUser.save();
      if (!user) {
        return res.status(400).json({
          message: "user was not created",
        });
      }
      res.status(201).json({
        message: "user was created, ready to sign in.",
      });
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

//Login User
const loginUser = async (req, res) => {
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

    // check if user already exist by email
    const user = await User.findOne({ email: email });
    if (!user) {
      return res.status(400).json({
        message: "User with this email does not exist. Please register.",
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
      message: "Login successful",
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

//Logout user
const logOutUser = (req, res) => {
  try {
    //destroy cookies when user logs out, the user isn't logged in anymore
    req.session.destroy();
    //clear the cookies and pass the session
    res.clearCookie("user_session");
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

//user profile
const userProfile = async (req, res) => {
  try {
    // if the user is logged in we always have req.session.userId = user._id
    const userData = await User.findById(req.session.userId, { password: 0 });

    res.status(201).json({
      ok: true,
      message: userData,
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      message: error.message,
    });
  }
};

//user CRUD operations
const deleteUser = async (req, res) => {
  try {
    // if the user is logged in we always have req.session.userId = user._id
    await User.findByIdAndDelete(req.session.userId);

    res.status(201).json({
      ok: true,
      message: "user was deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      message: error.message,
    });
  }
};

const updateUser = async (req, res) => {
  try {
    if (!req.body.password) {
      return res.status(404).json({
        message: "password is missing",
      });
    }
    //if we have the password, then we have to hash the password
    const hashedpassword = await securePassword(req.body.password);

    const updatedData = await User.findByIdAndUpdate(
      req.session.userId,
      {
        ...req.body,
        password: hashedpassword,
        image: req.file,
      },
      { new: true }
    );

    //check if user was updated
    if (!updatedData) {
      return res.status(400).json({
        ok: false,
        message: "user was not updated",
      });
    }

    //check if image exists while updating (using formidable)
    /*    if (req.files.image) {
      const { image } = req.files;
      updatedData.image.contentType = image.type;
      updatedData.image.data = fs.readFileSync(image.path);
    } */

    await updatedData.save();

    res.status(201).json({
      message: "User has been updated successfully",
      updatedData,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const forgetPassword = async (req, res) => {
  try {
    const { email, password } = req.body;

    //check if either of the fields are empty
    if (!email || !password) {
      return res.status(404).json({
        message: "Email or password field is missing",
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

    //check if user already exist
    const userExist = await User.findOne({
      email: email,
    });
    if (!userExist) {
      return res.status(400).json({
        message: `User with the ${email} does not exist`,
      });
    }

    //hash user password for security
    const hashedPassword = await securePassword(password);

    //create Token to store data
    const token = jwt.sign({ email, hashedPassword }, dev.app.jwtSecretKey, {
      expiresIn: "10m",
    });

    // prepare the email: what we want to show in the email
    const emailData = {
      email,
      subject: "Reset your password",
      html: `
         <h2>Hello ${userExist.name}</h2>
         <p>Please click here to <a href="${dev.app.clientUrl}/api/users/reset-password?token=${token}" target="_blank">Reset your password</a> </p>
         `, // html body
    };

    // send verification email to the user
    sendEmailWithNodeMailer(emailData);

    res.status(201).json({
      message: "An email has been sent for resetting password",
      token: token,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) {
      return res.status(404).json({
        message: "token is missing",
      });
    }

    // first verify user token
    jwt.verify(token, dev.app.jwtSecretKey, async function (err, decoded) {
      if (err) {
        return res.status(401).json({
          message: "Token is expired",
        });
      }
      // decoded the user data
      const { email, hashedPassword } = decoded;

      // check if user already exist by email
      const isExist = await User.findOne({ email: email });
      if (!isExist) {
        return res.status(400).json({
          message: "User with this email does not exist",
        });
      }

      // Update the user - without that wants to reset password
      const updateData = await User.updateOne(
        { email: email },
        {
          $set: {
            password: hashedPassword,
          },
        }
      );

      if (!updateData) {
        return res.status(400).json({
          message: "password was not updated",
        });
      }

      res.status(201).json({
        message: "Password has been successully updated",
        updateData,
      });
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = {
  register,
  verifyEmail,
  loginUser,
  logOutUser,
  userProfile,
  deleteUser,
  updateUser,
  forgetPassword,
  resetPassword,
};
