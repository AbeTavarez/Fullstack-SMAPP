const express = require("express");

const router = express.Router();
const { check, validationResult } = require("express-validator");
const auth = require("../../middleware/auth");
const Post = require("../../models/Post");
const User = require("../../models/User");
const Profile = require("../../models/Profile");

//* @route POST /api/posts
//* @desc Create a post
//* @access Private
router.post(
  "/",
  [auth, [check("text", "Text is required").notEmpty()]],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      // get user info
      const user = await User.findById(req.user.id).select("-password");
      // create new post object
      const newPost = new Post({
        text: req.body.text,
        name: user.name,
        avatar: user.avatar,
        user: req.user.id,
      });

      const post = await newPost.save();
      res.json(post);
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server Error");
    }
  }
);

//* @route GET /api/posts
//* @desc Get all posts
//* @access Private
router.get("/", auth, async (req, res) => {
  try {
    const posts = await Post.find().sort({ date: -1 });
    res.status(200).json(posts);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

//* @route GET /api/posts/:post_id
//* @desc Get single post by id
//* @access Private
router.get("/:post_id", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.post_id);

    if (!post) {
      return res.status(404).json({ msg: "Post not found." });
    }
    res.status(200).json(post);
  } catch (err) {
    console.error(err.message);
    if (err.kind === "ObjectId") {
      return res.status(404).json({ msg: "Post not found." });
    }
    res.status(500).send("Server Error");
  }
});

//* @route DELETE /api/posts/:post_id
//* @desc Delete a post
//* @access Private
router.delete("/:post_id", auth, async (req, res) => {
  try {
    // find the post
    const post = await Post.findById(req.params.post_id);

    // checks if no post was found
    if (!post) {
      return res.status(404).json({ msg: "Post not found." });
    }
    // check if the user if the owner of the post
    if (post.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: "User not authorized." });
    }
    
    await post.remove(); // remove post
    res.status(200).json({ msg: "Post removed." });
  } catch (err) {
    console.error(err.message);
    if (err.kind === "ObjectId") {
      return res.status(404).json({ msg: "Post not found." });
    }
    res.status(500).send("Server Error");
  }
});

module.exports = router;
