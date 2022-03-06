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

    // gets user info
    const user = await User.findById(req.user.id).select("-password");

    //* Build profile object
    const profileFields = {};
    profileFields.user = req.user.id;
    profileFields.username = user.name;
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

    //* Build social object
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

        return res.json(profile);
      }

      //* ============== Create New Profile
      profile = new Profile(profileFields);
      await profile.save();

      res.json(profile);
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server Error");
    }
  }
);

//* @route GET /api/profile
//* @desc Get All Profiles
//* @access Public
router.get("/", async (req, res) => {
  try {
    const profiles = await Profile.find().populate("user", ["name", "avatar"]);
    res.json(profiles);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

//* @route GET /api/profile/:username
//* @desc Get Profile by user name
//* @access Public
router.get("/:username", async (req, res) => {
  try {
    const profile = await Profile.findOne({ username: req.params.username });
    console.log(profile);
    if (!profile)
      return res.status(400).json({ msg: "No profile found for this user." });

    res.json(profile);
  } catch (err) {
    console.error(err.message);
    if (err.kind === "ObjectId") {
      return res.status(400).json({ msg: "No profile found for this user." });
    }
    res.status(500).send("Server Error");
  }
});

//* @route GET /api/profile/users/:user_id
//* @desc Get Profile by user id
//* @access Public
router.get("/users/:user_id", async (req, res) => {
  try {
    const profile = await Profile.findOne({
      user: req.params.user_id,
    }).populate("user", ["name", "avatar"]);

    if (!profile)
      return res.status(400).json({ msg: "No profile found for this user." });

    res.json(profile);
  } catch (err) {
    console.error(err.message);
    if (err.kind === "ObjectId") {
      return res.status(400).json({ msg: "No profile found for this user." });
    }
    res.status(500).send("Server Error");
  }
});

//* @route DELETE /api/profile
//* @desc Delete profile, user, and posts
//* @access Private
router.delete("/", auth, async (req, res) => {
  try {
    // TODO remove users posts

    //! Remove profile
    await Profile.findOneAndRemove({ user: req.user.id });
    //! Remove user
    await User.findOneAndRemove({ _id: req.user.id });

    res.json({ msg: "User account deleted" });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

//* @route POST /api/profile/experience
//* @desc Add profile experience
//* @access Private
router.post(
  "/experience",
  [
    auth,
    [
      check("title", "Title is required.").not().isEmpty(),
      check("company", "Company is required.").not().isEmpty(),
      check("from", "From date is required.").not().isEmpty(),
    ],
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // get all fields
    const { title, company, location, from, to, current, description } =
      req.body;
    // create a new experience object
    const newExp = {
      title,
      company,
      location,
      from,
      to,
      current,
      description,
    };

    try {
      // get the profile to update
      const profile = await Profile.findOne({ user: req.user.id });

      // add the new experience to the beginning of the experience array
      profile.experience.unshift(newExp);

      await profile.save(); // save profile

      res.json(profile); // send back the profile
      
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server Error");
    }
  }
);


// TODO edit experience
//* @route PUT /api/profile/experience/:exp_id
//* @desc Edit a profile experience
//* @access Private
router.put(
  "/experience",
  [
    auth,
    [
      check("title", "Title is required.").not().isEmpty(),
      check("company", "Company is required.").not().isEmpty(),
      check("from", "From date is required.").not().isEmpty(),
    ],
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // get all fields
    const { title, company, location, from, to, current, description } =
      req.body;
    // create a new experience object
    const newExp = {
      title,
      company,
      location,
      from,
      to,
      current,
      description,
    };

    try {
      // get the profile to update
      const profile = await Profile.findOne({ user: req.user.id });

      // add the new experience to the beginning of the experience array
      profile.experience.unshift(newExp);

      await profile.save(); // save profile

      res.json(profile); // send back the profile

    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server Error");
    }
  }
);


//* @route DELETE /api/profile/experience/:exp_id
//* @desc Delete experience from profile
//* @access Private
router.delete("/experience/:exp_id", auth, async (req, res) => {
    try {
        
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error")
    }
})


module.exports = router;
