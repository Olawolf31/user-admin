const User = require("../models/user");
const { comparePassword } = require("../helpers/bcryptPassword");
const exceljs = require("exceljs");

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
    res.status(200).json({
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

const deleteUserByAdmin = async (req, res) => {
  try {
    const { id } = req.params;

    const findUser = await User.findById(id);
    if (!findUser) {
      return res.status(404).json({
        message: "user was not found",
      });
    }

    await User.findByIdAndDelete(id);

    res.status(200).json({
      ok: true,
      message: "deleted user successfully",
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      message: error.message,
    });
  }
};

const updateUserByAdmin = async (req, res) => {
  try {
    // fetch the id of a user
    const { id } = req.params;
    // find user to update by id
    const updatedData = await User.findByIdAndUpdate(
      id,
      { ...req.body },
      { new: true }
    );
    if (!updatedData) {
      return res.json(404).json({
        message: "user was not found",
      });
    }
    await updatedData.save();

    if (!updatedData) {
      return res.status(400).json({
        message: "user was not updated",
      });
    }

    res.status(200).json({
      message: "user was updated successfully",
    });
  } catch (error) {
    console.log(error);
  }
};

const exportUsers = async (req, res) => {
  try {
    const workbook = new exceljs.Workbook();
    const worksheet = workbook.addWorksheet("Users");
    worksheet.columns = [
      { header: "Name", key: "name" },
      { header: "email", key: "email" },
      { header: "Phone Number", key: "phone" },
      { header: "Profile Picture", key: "avatar" },
      { header: "Is Admin", key: "is_admin" },
      { header: "Is Verified", key: "is_verified" },
      { header: "Is Banned", key: "is_banned" },
    ];

    // fetch all the user's data
    const userData = await User.find();

    // map through the user
    userData.map((user) => {
      worksheet.addRow(user);
    });

    worksheet.getRow(1).eachCell((cell) => {
      cell.font = { bold: true };
    });

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=" + "users.xlsx"
    );
    return workbook.xlsx.write(res).then(() => {
      res.status(200).end();
    });
  } catch (error) {
    console.log(error);
  }
};

//admin-profile, reset password, forget password, dashboard -- CRUD --create user, read all users except admin

module.exports = {
  loginAdmin,
  logoutAdmin,
  getAllUsers,
  deleteUserByAdmin,
  updateUserByAdmin,
  exportUsers,
};
