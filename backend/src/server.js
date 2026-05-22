const express = require("express");
const cors = require("cors");
const session = require("express-session");
const passport = require("passport");

require("dotenv").config();

require("./config/passport");

const dashboardRoutes =
require(
"./routes/dashboardRoutes"
);

const {
  startSchedulerCron,
} = require("./cron/schedulerCron");

const businessRoutes = require(
  "./routes/businessRoutes"
);

const authRoutes = require(
  "./routes/authRoutes"
);

const testRoutes = require(
  "./routes/testRoutes"
);

const postRoutes = require(
  "./routes/postRoutes"
);

const googleRoutes = require(
  "./routes/googleRoutes"
);

const app = express();

app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

app.use(express.json());

app.use(
  session({
    secret:
      process.env.SESSION_SECRET ||
      "supersecret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false,
      maxAge:
        1000 * 60 * 60 * 24,
    },
  })
);

app.use(passport.initialize());

app.use(passport.session());

app.get("/", (req, res) => {
  res.send(
    "Content Scheduler Backend Running"
  );
});

app.use(
  "/api/auth",
  authRoutes
);

app.use(
  "/api/test",
  testRoutes
);

app.use(
  "/api/posts",
  postRoutes
);

app.use(
  "/api/business",
  businessRoutes
);

app.use(
  "/api/google",
  googleRoutes
);

app.use(
"/api/dashboard",
dashboardRoutes
);

startSchedulerCron();

const PORT =
  process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(
    `Server running on port ${PORT}`
  );
});