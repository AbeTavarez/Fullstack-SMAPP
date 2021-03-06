const express = require("express");
const { check, validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const config = require("config");
const router = express.Router();
const auth = require("../../middleware/auth");
const User = require("../../models/User");

//* @route GET /api/auth
//* @desc Get authenticated user
//* @access Public
router.get("/", auth, async (req, res) => {
  try {
    // we can access the user by req.user
    // bc in our middleware we setup the user to the user id
    const user = await User.findById(req.user.id).select("-password");
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});


//* @route POST /api/auth
//* @desc Authenticate user and get token
//* @access Public
router.post(
  "/",
  [
    check("email", "Please include a valid email").isEmail(),
    check(
      "password",
      "Password is required."
    ).exists(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    try {
      // check if user already exists
      let user = await User.findOne({ email });

      if (!user) {
        // If user doesn't exists
        return res
          .status(400)
          .json({ errors: [{ msg: "Invalid credentials" }] });
      }

      //
      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) {
        return res
          .status(400)
          .json({ errors: [{ msg: "Invalid credentials" }] });
      }

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
