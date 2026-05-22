const { generatePost } = require("./src/services/aiService");

generatePost({
  businessName: "Tap and Tour",
  businessType: "Travel Agency",
  services: "Tour packages, bookings",
  tone: "friendly"
}).then(console.log);