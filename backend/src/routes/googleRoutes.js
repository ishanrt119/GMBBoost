const express = require("express");

const passport = require("passport");

const prisma = require(
  "../config/prisma"
);

const authMiddleware = require(
  "../middleware/authMiddleware"
);

const {
  getBusinessAccounts,
} = require(
  "../controllers/googleBusinessController"
);

const router = express.Router();

router.get(
  "/login",
   authMiddleware,
  (req, res, next) => {
    const state = Buffer.from(
      JSON.stringify({
        userId: req.user.userId,
        //userId: 2,
      })
    ).toString("base64");

    passport.authenticate(
      "google",
      {
        scope: [
          "profile",
          "email",
          "https://www.googleapis.com/auth/business.manage",
        ],

        accessType:
          "offline",

        prompt: "consent",

        state,
      }
    )(req, res, next);
  }
);

router.get(
  "/callback",

  passport.authenticate(
    "google",
    {
      failureRedirect:
        "/login",

      session: false,
    }
  ),

  async (req, res) => {
    try {
      const stateData =
        JSON.parse(
          Buffer.from(
            req.query.state,
            "base64"
          ).toString()
        );

      const userId =
        stateData.userId;

      await prisma.user.update({
        where: {
          id: userId,
        },

        data: {
          googleAccessToken:
            req.user.accessToken,

          googleRefreshToken:
            req.user
              .refreshToken,

          googleConnected: true,

          googleTokenExpiry:
            new Date(
              Date.now() +
                3600 * 1000
            ),
        },
      });

      res.status(200).json({
        message:
          "Google account connected successfully",
      });
    } catch (error) {
      console.log(error);

      res.status(500).json({
        message:
          "Google connection failed",
      });
    }
  }
);

router.get(
  "/business-accounts",
  authMiddleware,
  getBusinessAccounts
);

module.exports = router;