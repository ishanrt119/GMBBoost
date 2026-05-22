const prisma = require("../config/prisma");

const {
  generatePost,
} = require("../services/aiService");

const VALID_STATUSES = [
  "DRAFT",
  "PENDING_APPROVAL",
  "APPROVED",
  "REJECTED",
  "SCHEDULED",
  "PUBLISHED",
  "FAILED",
  "ARCHIVED",
];

const createPost = async (req, res) => {

  try {

    const {
      title,
      content,
      imageUrl,
      scheduledFor,
    } = req.body;

    const post =
      await prisma.post.create({

        data: {

          title,

          content,

          imageUrl,

          scheduledFor:
            scheduledFor
              ? new Date(
                  scheduledFor
                )
              : null,

          status:
            "PENDING_APPROVAL",

          aiGenerated: false,

          userId:
            req.user.userId,

        },

      });

    res.status(201).json({

      message:
        "Post created successfully",

      post,

    });

  }

  catch (error) {

    console.log(error);

    res.status(500).json({
      message: "Server error",
    });

  }

};

const generateAiPost = async (
  req,
  res
) => {

  try {

    const businessProfile =
      await prisma.businessProfile.findFirst({

        where: {
          userId:
            req.user.userId,
        },

      });

    if (!businessProfile) {

      return res
      .status(404)
      .json({
        message:
          "Business profile not found",
      });

    }

    const aiContent =
      await generatePost(
        businessProfile
      );

    if (!aiContent) {

      return res
      .status(500)
      .json({
        message:
          "AI generation failed",
      });

    }

    res.status(200).json({

      title:
        `${businessProfile.businessName} Update`,

      content:
        aiContent,

    });

  }

  catch (error) {

    console.log(error);

    res.status(500).json({
      message:
        "Server error",
    });

  }

};

const getMyPosts = async (
  req,
  res
) => {

  try {

    const posts =
      await prisma.post.findMany({

        where: {
          userId:
            req.user.userId,
        },

        orderBy: {
          scheduledFor: "asc",
        },

      });

    res.status(200).json({
      posts,
    });

  }

  catch (error) {

    console.log(error);

    res.status(500).json({
      message: "Server error",
    });

  }

};

const getPendingPosts =
async (req, res) => {

  try {

    const posts =
      await prisma.post.findMany({

        where: {

          userId:
            req.user.userId,

          status:
            "PENDING_APPROVAL",

        },

        orderBy: {
          createdAt: "desc",
        },

      });

    res.status(200).json({
      posts,
    });

  }

  catch (error) {

    console.log(error);

    res.status(500).json({
      message: "Server error",
    });

  }

};

const getScheduledPosts =
async (req, res) => {

  try {

    const posts =
      await prisma.post.findMany({

        where: {

          userId:
            req.user.userId,

          status:
            "SCHEDULED",

        },

        orderBy: {
          scheduledFor: "asc",
        },

      });

    res.status(200).json({
      posts,
    });

  }

  catch (error) {

    console.log(error);

    res.status(500).json({
      message: "Server error",
    });

  }

};

const approvePost =
async (req, res) => {

  try {

    const { postId } =
      req.params;

    const post =
      await prisma.post.findFirst({

        where: {

          id:
            Number(postId),

          userId:
            req.user.userId,

        },

      });

    if (!post) {

      return res
      .status(404)
      .json({
        message:
          "Post not found",
      });

    }

    const updatedPost =
      await prisma.post.update({

        where: {
          id:
            Number(postId),
        },

        data: {

          status:
            "SCHEDULED",

        },

      });

    res.status(200).json({

      message:
        "Post approved successfully",

      updatedPost,

    });

  }

  catch (error) {

    console.log(error);

    res.status(500).json({
      message: "Server error",
    });

  }

};

const rejectPost =
async (req, res) => {

  try {

    const { postId } =
      req.params;

    const post =
      await prisma.post.findFirst({

        where: {

          id:
            Number(postId),

          userId:
            req.user.userId,

        },

      });

    if (!post) {

      return res
      .status(404)
      .json({
        message:
          "Post not found",
      });

    }

    const updatedPost =
      await prisma.post.update({

        where: {
          id:
            Number(postId),
        },

        data: {

          status:
            "REJECTED",

        },

      });

    res.status(200).json({

      message:
        "Post rejected successfully",

      updatedPost,

    });

  }

  catch (error) {

    console.log(error);

    res.status(500).json({
      message: "Server error",
    });

  }

};

const updatePost = async (
  req,
  res
) => {

  try {

    const { postId } =
      req.params;

    const {
      title,
      content,
      imageUrl,
      scheduledFor,
      status,
    } = req.body;

    const existingPost =
      await prisma.post.findFirst({

        where: {

          id:
            Number(postId),

          userId:
            req.user.userId,

        },

      });

    if (!existingPost) {

      return res
      .status(404)
      .json({
        message:
          "Post not found",
      });

    }

    if (
      status &&
      !VALID_STATUSES.includes(
        status
      )
    ) {

      return res
      .status(400)
      .json({
        message:
          "Invalid status",
      });

    }

    const updatedPost =
      await prisma.post.update({

        where: {
          id:
            Number(postId),
        },

        data: {

          title,

          content,

          imageUrl,

          scheduledFor:
            scheduledFor
              ? new Date(
                  scheduledFor
                )
              : null,

          status,
        },

      });

    res.status(200).json({

      message:
        "Post updated successfully",

      updatedPost,

    });

  }

  catch (error) {

    console.log(error);

    res.status(500).json({
      message: "Server error",
    });

  }

};

const deletePost = async (
  req,
  res
) => {

  try {

    const { postId } =
      req.params;

    const existingPost =
      await prisma.post.findFirst({

        where: {

          id:
            Number(postId),

          userId:
            req.user.userId,

        },

      });

    if (!existingPost) {

      return res
      .status(404)
      .json({
        message:
          "Post not found",
      });

    }

    await prisma.post.delete({

      where: {
        id:
          Number(postId),
      },

    });

    res.status(200).json({

      message:
        "Post deleted successfully",

    });

  }

  catch (error) {

    console.log(error);

    res.status(500).json({
      message: "Server error",
    });

  }

};

module.exports = {

  createPost,

  generateAiPost,

  getMyPosts,

  getPendingPosts,

  getScheduledPosts,

  approvePost,

  rejectPost,

  updatePost,

  deletePost,

};