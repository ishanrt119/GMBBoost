const express = require("express");

const {
  createPost,
  generateAiPost,
  getMyPosts,
  getPendingPosts,
  getScheduledPosts,
  approvePost,
  rejectPost,
  updatePost,
  deletePost,
} = require("../controllers/postController");

const authMiddleware =
require("../middleware/authMiddleware");

const router = express.Router();

router.get(
  "/generate-ai",
  authMiddleware,
  generateAiPost
);

router.post(
  "/create",
  authMiddleware,
  createPost
);

router.get(
  "/my-posts",
  authMiddleware,
  getMyPosts
);

router.get(
  "/pending",
  authMiddleware,
  getPendingPosts
);

router.get(
  "/scheduled",
  authMiddleware,
  getScheduledPosts
);

router.post(
  "/approve/:postId",
  authMiddleware,
  approvePost
);

router.post(
  "/reject/:postId",
  authMiddleware,
  rejectPost
);

router.put(
  "/update/:postId",
  authMiddleware,
  updatePost
);

router.delete(
  "/delete/:postId",
  authMiddleware,
  deletePost
);

module.exports = router;