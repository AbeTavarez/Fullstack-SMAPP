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

//* @route PUT /api/posts/like/:post_id
//* @desc Like a post
//* @access Private
router.put("/like/:post_id", auth, async (req, res) => {
  try {
    //fetch post
    const post = await Post.findById(req.params.post_id);

    // check if post was already liked by this user
    if (
      post.likes.filter((like) => like.user.toString() === req.user.id).length >
      0
    ) {
      return res.status(400).json({ msg: "Post already liked by user." });
    }
    // like post
    post.likes.unshift({ user: req.user.id });
    await post.save();
    res.json(post.likes);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

//* @route PUT /api/posts/unlike/:post_id
//* @desc Unlike a post
//* @access Private
router.put("/unlike/:post_id", auth, async (req, res) => {
  try {
    //fetch post
    const post = await Post.findById(req.params.post_id);

    // check if post was already liked by this user
    if (
      post.likes.filter((like) => like.user.toString() === req.user.id)
        .length === 0
    ) {
      return res
        .status(400)
        .json({ msg: "Post has not been yet liked by user." });
    }
    // get the index to remove
    const removeIndex = post.likes
      .map((like) => like.user.toString())
      .indexOf(req.user.id);
    // remove the like from the likes array
    post.likes.splice(removeIndex, 1);
    // save
    await post.save();
    // res
    res.json(post.likes);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});


//* @route POST /api/posts/comments/comment_id
//* @desc Create a comment on a post
//* @access Private
router.post(
    "/comment/:comment_id",
    [auth, [check("text", "Text is required").notEmpty()]],
    async (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
  
      try {
        // get user who is commenting
        const user = await User.findById(req.user.id).select("-password");
        // get the post to comment
        const post = await Post.findById(req.params.comment_id)
        // create new comment object
        const newComment = {
          text: req.body.text,
          name: user.name,
          avatar: user.avatar,
          user: req.user.id,
        };
        // add new post to comment array
        post.comments.unshift(newComment);
        //save
        await post.save();
        res.json(post.comments);
      } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
      }
    }
  );

module.exports = router;
