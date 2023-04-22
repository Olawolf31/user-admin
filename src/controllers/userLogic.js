const register = (req, res) => {
  try {
    const { name, email, password, phone } = req.fields;
    const { image } = req.files;

    //check if fields are not empty
    if ((!name || !email || !password, !phone)) {
      return res.status(404).json({
        message: "one or more fields is missing",
      });
    }

    //check password length
    if (password.length < 6) {
      return res.status(404).json({
        message: "Minimum length for password is less than 6 characters",
      });
    }

    //Check if image is added and size is greater 1MB
    if (image && image.size > 1000000) {
      return res.status(404).json({
        message: "Maximum image size is 1MB",
      });
    }

    console.log(
      res.status(201).json({
        message: "user has been added",
      })
    );
  } catch (error) {
    console.log(error);
  }
};

module.exports = register;
