const mongoose = require("mongoose");
const dev = require("./index");

const connectDB = async () => {
  try {
    await mongoose.connect(dev.db.URL);
    console.log("connected to database");
  } catch (error) {
    console.log(error);
  }
};

module.exports = connectDB;
