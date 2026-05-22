const cron = require("node-cron");

const {
  checkScheduledPosts,
} = require("../services/schedulerService");

const {
  publishScheduledPosts,
} = require("../services/publishService");

let isSchedulerRunning = false;

const startSchedulerCron = () => {

  cron.schedule("* * * * *", async () => {

    if (isSchedulerRunning) {

      console.log(
        "Scheduler already running. Skipping..."
      );

      return;

    }

    try {

      isSchedulerRunning = true;

      console.log(
        "Running scheduler automation..."
      );

      await publishScheduledPosts();

      await checkScheduledPosts();

    }

    catch (err) {

      console.log(
        "Cron Error:",
        err.message
      );

    }

    finally {

      isSchedulerRunning = false;

    }

  });

};

module.exports = {
  startSchedulerCron,
};