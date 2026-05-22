const {
  fetchBusinessAccounts,
} = require(
  "../services/googleBusinessService"
);

const getBusinessAccounts =
  async (req, res) => {
    try {
      const data =
        await fetchBusinessAccounts(
          req.user.userId
        );

      res.status(200).json(data);
    } catch (error) {
      console.log(error);

      res.status(500).json({
        message:
          "Failed to fetch business accounts",
      });
    }
  };

module.exports = {
  getBusinessAccounts,
};