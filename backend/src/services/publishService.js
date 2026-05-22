const prisma = require("../config/prisma");

const publishScheduledPosts =
async () => {

  try {

    console.log(
      "Checking posts for publishing..."
    );

    const now = new Date();

    const posts =
      await prisma.post.findMany({

        where: {

          status: "SCHEDULED",

          scheduledFor: {
            lte: now,
          },

        },

      });

    if (posts.length === 0) {

      console.log(
        "No posts ready for publishing"
      );

      return;

    }

    for (const post of posts) {

      try {

        await prisma.post.update({

          where: {
            id: post.id,
          },

          data: {

            status:
              "PUBLISHED",

            publishedAt:
              new Date(),

          },

        });

        console.log(
          `Post ${post.id} published`
        );

      }

      catch (err) {

        console.log(
          `Failed to publish post ${post.id}`
        );

        console.log(err.message);

        await prisma.post.update({

          where: {
            id: post.id,
          },

          data: {

            status:
              "FAILED",

            failureReason:
              err.message,

            retryCount: {
              increment: 1,
            },

          },

        });

      }

    }

  }

  catch (error) {

    console.log(
      "Publish Service Error:",
      error.message
    );

  }

};

module.exports = {
  publishScheduledPosts,
};