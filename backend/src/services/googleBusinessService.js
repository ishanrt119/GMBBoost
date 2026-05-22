const { google } = require("googleapis");
const prisma = require("../config/prisma");

const getGoogleClient = async (
  userId
) => {
  const user =
    await prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

  if (
    !user ||
    !user.googleAccessToken
  ) {
    throw new Error(
      "Google account not connected"
    );
  }

  const oauth2Client =
    new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );

  oauth2Client.setCredentials({
    access_token:
      user.googleAccessToken,

    refresh_token:
      user.googleRefreshToken,
  });

  return oauth2Client;
};

const fetchBusinessAccounts =
  async (userId) => {
    try {
      const auth =
        await getGoogleClient(
          userId
        );

      const businessApi =
        google.mybusinessaccountmanagement(
          {
            version: "v1",
            auth,
          }
        );

      const response =
        await businessApi.accounts.list(
          {},
          {
            retry: false,
          }
        );

      return response.data;

    } catch (error) {

      console.log(
        "Google Business Error:"
      );

      console.log(
        error?.response?.data ||
        error.message
      );

      throw error;
    }
  };

module.exports = {
  fetchBusinessAccounts,
};