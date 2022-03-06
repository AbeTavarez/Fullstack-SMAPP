const express = require("express");
const router = express.Router();
const { check, validationResult } = require("express-validator");
const gravatar = require("gravatar");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const config = require("config");
const User = require("../../models/User");

//* @route GET /api/users
// @desc Test route
// @access Public
router.get("/", (req, res) => {
  res.send("user route");
});

//* @route POST /api/users
//* @desc Register user
//* @access Public
router.post(
  "/",
  [
    check("name", "Name is required").not().isEmpty(),
    check("email", "Please include a valid email").isEmail(),
    check(
      "password",
      "Please enter a password with 8 or more characters."
    ).isLength(8),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password } = req.body;

    try {
      // check if user already exists
      let user = await User.findOne({ email });

      if (user) {
        // If user already exists
        return res
          .status(400)
          .json({ errors: [{ msg: "User already exists" }] });
      }

      // user gravatar
      const avatar = gravatar.url(email, {
        s: "200",
        r: "pg",
        d: "mm",
      });

      // use the user variable to create a new user instance
      user = new User({
        name,
        email,
        avatar,
        password,
      });

      // encrypt password
      const SALT = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, SALT);
      await user.save(); // saving the new user

      // return jwt
      const payload = {
        id: user.id,
      };

      jwt.sign(
        payload,
        config.get('jwtSecret'),
        {
          expiresIn: 360000,
        },
        (err, token) => {
          if (err) throw err;
          res.json({ token });
        }
      );
    } catch (err) {
      console.error(err);
      res.status(500).json({ msg: "Server error" });
    }
  }
);

module.exports = router;
