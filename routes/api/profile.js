const express = require("express");
const router = express.Router();
const auth = require("../../middleware/auth");
const { check, validationResult } = require("express-validator");

const Profile = require("../../models/Profile");
const User = require("../../models/User");
const { default: mongoose } = require("mongoose");

// TODO ==========================>
// -note: we have access to the [req.user].
// so we can access the user id that comes in the token

//* @route GET /api/profile
//* @desc Test route
//* @access Public
router.get("/", (req, res) => res.send("Profile test route"));

//* @route GET /api/profile/me
//* @desc Get current user profile
//* @access Private
router.get("/me", auth, async (req, res) => {
  try {
    // finds the user profile and populates it with the name and avatar of the user.
    const profile = await Profile.findOne({ user: req.user.id }).populate(
      "user",
      ["name", "avatar"]
    );

    if (!profile) {
      return res.status(400).json({ msg: "No profile found for this user." });
    }

    // send profile with the user populated data
    res.json(profile);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});

//* @route POST /api/profile
//* @desc Create or update an user's profile
//* @access Private
router.post(
  "/",
  [
    auth,
    [
      check("status", "Status is required").not().isEmpty(),
      check("skills", "Skills is required.").not().isEmpty(),
    ],
  ],
  async (req, res) => {
    //* Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    //* Destructure all props
    const {
      company,
      website,
      location,
      bio,
      status,
      githubusername,
      skills,
      youtube,
      facebook,
      twitter,
      instagram,
      linkedin,
      tiktok,
    } = req.body;

    //* Build profile object
    const profileFields = {};
    profileFields.user = req.user.id;
    if (company) profileFields.company = company;
    if (website) profileFields.website = website;
    if (location) profileFields.location = location;
    if (bio) profileFields.bio = bio;
    if (status) profileFields.status = status;
    if (githubusername) profileFields.githubusername = githubusername;
    if (skills) {
      // skills is a string so we split to make an array and then trim it
      profileFields.skills = skills.split(",").map((skill) => skill.trim());
    }

    // Build social object
    profileFields.social = {};
    if (youtube) profileFields.social.youtube = youtube;
    if (twitter) profileFields.social.twitter = twitter;
    if (facebook) profileFields.social.facebook = facebook;
    if (instagram) profileFields.social.instagram = instagram;
    if (tiktok) profileFields.social.tiktok = tiktok;
    if (linkedin) profileFields.social.linkedin = linkedin;

    try {
      if (mongoose.Types.ObjectId(req.user.id)) console.log("user is valid");
      
      let profile = await Profile.findOne({ user: req.user.id });

      //* =============== Update existing Profile
      if (profile) {
        profile = await Profile.findByIdAndUpdate(
          req.user.id,
          { $set: profileFields },
          { new: true, upsert: true }
        );
        // console.log('exitst',profile);
        return res.json(profile);
      }

      //* ============== Create New Profile
      profile = new Profile(profileFields);
      await profile.save();
      //   console.log('NOT exitst',profile);
      res.json(profile);
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server Error");
    }
  }
);

module.exports = router;
