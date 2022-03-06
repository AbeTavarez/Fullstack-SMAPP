const express = require("express");
const router = express.Router();
const auth = require("../../middleware/auth");

const Profile = require("../../models/Profile");
const User = require("../../models/User");

// TODO
// -note: we have access to the [req.user].
// so we can access the user id that comes in the token

// @route GET /api/profile
// @desc Test route
// @access Public
router.get("/", (req, res) => res.send("Profile route"));

// @route GET /api/profile/me
// @desc Get current user profile
// @access Private
router.get("/me", auth, async (req, res) => {
  try {
      // finds the user profile and populates it with the name and avatar of the user.
    const profile = await Profile.findOne({ user: req.user.id }).populate(
      "user",
      ["name", "avatar"]
    );

    if (!profile) {
        return res.status(400).json({msg: "No profile found for this user."})
    }

    // send profile with the user populated data
    res.json(profile);

  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});

module.exports = router;
