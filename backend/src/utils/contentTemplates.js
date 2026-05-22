const generateBusinessPost = (
  profile,
  index
) => {
  const templates = [
    `Admissions open for ${profile.services} at ${profile.businessName}, ${profile.city}. Contact us today for details.`,

    `${profile.businessName} is helping students achieve success in ${profile.services}. Enroll now.`,

    `Looking for quality ${profile.businessType} in ${profile.city}? ${profile.businessName} is now accepting admissions.`,

    `${profile.offers || "Special offers available"} at ${profile.businessName}. Visit us today.`,

    `Start your learning journey with ${profile.businessName}. Trusted ${profile.businessType} in ${profile.city}.`,
  ];

  return templates[
    index % templates.length
  ];
};

module.exports = {
  generateBusinessPost,
};