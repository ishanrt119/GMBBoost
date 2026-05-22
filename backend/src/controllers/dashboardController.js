const prisma = require("../config/prisma");

const getDashboardStats =
async (req, res) => {

  try {

    const userId =
      req.user.userId;

    const totalPosts =
      await prisma.post.count({
        where: {
          userId,
        },
      });

    const pendingPosts =
      await prisma.post.count({
        where: {
          userId,
          status:
            "PENDING_APPROVAL",
        },
      });

    const approvedPosts =
      await prisma.post.count({
        where: {
          userId,
          status:
            "APPROVED",
        },
      });

    const rejectedPosts =
      await prisma.post.count({
        where: {
          userId,
          status:
            "REJECTED",
        },
      });

    const scheduledPosts =
      await prisma.post.count({
        where: {
          userId,
          status:
            "SCHEDULED",
        },
      });

    const publishedPosts =
      await prisma.post.count({
        where: {
          userId,
          status:
            "PUBLISHED",
        },
      });

    res.status(200).json({

      totalPosts,

      pendingPosts,

      approvedPosts,

      rejectedPosts,

      scheduledPosts,

      publishedPosts,

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

module.exports = {
  getDashboardStats,
};