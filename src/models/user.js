const { Schema, model } = require("mongoose");
const validator = require("validator");

const userSchema = new Schema(
  {
    name: {
      type: String,
      trim: true,
      required: [true, "name is required"],
      minlength: [2, "Min length for name is 2 characters"],
      maxlength: [100, "Max length for name is 100 characters"],
    },
    email: {
      type: String,
      trim: true,
      required: [true, "email is required"],
      unique: true,
      lowercase: true,
      validate: {
        validator: function (value) {
          return validator.isEmail(value);
        },
        message: "Invalid email address",
      },
    },
    password: {
      type: String,
      required: [true, "password is required"],
      min: 6,
    },
    phone: {
      type: String,
      required: [true, "phone number is required"],
    },
    is_verified: {
      type: Number,
      default: 0,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    /*     image: {
      contentType: String,
      data: Buffer,
    } */

    image: {
      type: String,
      default: "../../public/images/defaultUser.png",
    },
    is_admin: {
      type: Boolean,
      default: false,
    },
    is_banned: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const User = model("users", userSchema);

module.exports = User;
