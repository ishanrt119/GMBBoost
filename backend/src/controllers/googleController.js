const oauth2Client = require(
  "../services/googleService"
);

const prisma = require(
  "../config/prisma"
);

const googleLogin = async (
  req,
  res
) => {
  try {
    const scopes = [
      "openid",
      "profile",
      "email",
      "https://www.googleapis.com/auth/business.manage",
    ];

    const url =
      oauth2Client.generateAuthUrl({
        access_type: "offline",
        prompt: "consent",
        scope: scopes,
      });

    res.redirect(url);
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message:
        "Google auth failed",
    });
  }
};

const googleCallback = async (
  req,
  res
) => {
  try {
    const { code } = req.query;

    const { tokens } =
      await oauth2Client.getToken(code);

    oauth2Client.setCredentials(
      tokens
    );

    res.status(200).json({
      message:
        "Google connected successfully",
      tokens,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message:
        "Google callback failed",
    });
  }
};

module.exports = {
  googleLogin,
  googleCallback,
};