const prisma = require("../config/prisma");

const {
  generatePost,
} = require("./aiService");

const MIN_SCHEDULED_POSTS = 7;

const generateNextDate = (
  baseDate,
  daysAhead
) => {

  const date = new Date(baseDate);

  date.setDate(
    date.getDate() + daysAhead
  );

  return date;
};

const createLog = async (
  action,
  status,
  message
) => {

  try {

    await prisma.schedulerLog.create({
      data: {
        action,
        status,
        message,
      },
    });

  }

  catch (err) {

    console.log(
      "Log Error:",
      err.message
    );

  }

};

const checkScheduledPosts =
async () => {

  try {

    console.log(
      "Checking scheduled posts..."
    );

    await createLog(
      "SCHEDULER_START",
      "SUCCESS",
      "Scheduler started"
    );

    const users =
      await prisma.user.findMany({

        include: {
          posts: true,
          businessProfile: true,
        },

      });

    const today = new Date();

    for (const user of users) {

      if (!user.businessProfile) {

        await createLog(
          "PROFILE_CHECK",
          "FAILED",
          `No business profile for ${user.email}`
        );

        continue;
      }

      const futurePosts =
        user.posts.filter((post) => {

          return (
            post.scheduledFor &&
            new Date(post.scheduledFor) > today &&
            post.status === "SCHEDULED"
          );

        });

      const sortedPosts =
        futurePosts.sort(
          (a, b) =>
            new Date(a.scheduledFor) -
            new Date(b.scheduledFor)
        );

      console.log(
        `${user.email} has ${futurePosts.length} scheduled posts`
      );

      if (
        futurePosts.length >=
        MIN_SCHEDULED_POSTS
      ) {

        continue;

      }

      const missingPosts =
        MIN_SCHEDULED_POSTS -
        futurePosts.length;

      for (
        let i = 1;
        i <= missingPosts;
        i++
      ) {

        try {

          const lastScheduledDate =
            sortedPosts.length > 0
              ? new Date(
                  sortedPosts[
                    sortedPosts.length - 1
                  ].scheduledFor
                )
              : new Date();

          const nextDate =
            generateNextDate(
              lastScheduledDate,
              i
            );

          const aiContent =
            await generatePost(
              user.businessProfile
            );

          if (!aiContent) {

            await createLog(
              "AI_GENERATION",
              "FAILED",
              `AI returned empty content for ${user.email}`
            );

            continue;
          }

          await prisma.post.create({

            data: {

              title:
                `${user.businessProfile.businessName} Update`,

              content: aiContent,

              status: "SCHEDULED",

              platform: "gmb",

              aiGenerated: true,

              scheduledFor: nextDate,

              generationPrompt:
                "Automated scheduler generation",

              userId: user.id,

            },

          });

          await createLog(
            "POST_CREATED",
            "SUCCESS",
            `AI post created for ${user.email}`
          );

          console.log(
            `Post generated for ${user.email}`
          );

        }

        catch (err) {

          console.log(
            "Generation Error:",
            err.message
          );

          await createLog(
            "POST_GENERATION",
            "FAILED",
            err.message
          );

        }

      }

    }

    await createLog(
      "SCHEDULER_COMPLETE",
      "SUCCESS",
      "Scheduler completed successfully"
    );

  }

  catch (error) {

    console.log(
      "Scheduler Error:",
      error.message
    );

    await createLog(
      "SCHEDULER_FATAL",
      "FAILED",
      error.message
    );

  }

};

module.exports = {
  checkScheduledPosts,
};