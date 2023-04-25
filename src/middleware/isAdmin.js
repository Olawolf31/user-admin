const User = require("../models/user");

const isAdmin = async (req, res, next) => {
  try {
    //req.session.userId - get the data of the person who is loggedin

    if (req.session.userId) {
      const id = req.session.userId;
      const adminData = await User.findById(id);
      if (adminData?.is_admin) {
        next();
      } else {
        return res.status(403).json({
          message: "you are not an admin",
        });
      }
    } else {
      return res.status(400).json({
        message: "please login",
      });
    }
  } catch (error) {
    console.log(error);
  }
};

module.exports = isAdmin;
