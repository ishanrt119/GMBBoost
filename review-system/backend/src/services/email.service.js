 // src/services/email.service.js
const nodemailer = require('nodemailer');
const { logger } = require('../utils/logger');

const transporter = nodemailer.createTransport({
  host: 'smtp.sendgrid.net',
  port: 587,
  auth: { user: 'apikey', pass: process.env.SENDGRID_API_KEY },
});

exports.sendEmail = async (to, customerName, service, reviewLink, businessName, requestId) => {
  // Use tracking link instead of direct Google link
  const trackingLink = requestId
    ? `${process.env.BACKEND_URL || 'http://localhost:4000'}/review/${requestId}`
    : reviewLink;

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><style>
  body { font-family: Arial, sans-serif; background: #f4f4f4; margin: 0; padding: 20px; }
  .card { background: #fff; border-radius: 12px; max-width: 520px; margin: 0 auto; padding: 32px; }
  h2 { color: #1a1a2e; font-size: 22px; margin-bottom: 8px; }
  p { color: #555; line-height: 1.6; }
  .btn { display: inline-block; background: #4f6ef7; color: #fff; padding: 14px 28px;
         border-radius: 8px; text-decoration: none; font-weight: 700; margin: 20px 0; font-size: 15px; }
  .stars { font-size: 28px; color: #fbbf24; letter-spacing: 4px; margin: 12px 0; }
  .footer { color: #aaa; font-size: 12px; margin-top: 24px; }
</style></head>
<body>
  <div class="card">
    <div class="stars">★★★★★</div>
    <h2>Hi ${customerName}! 👋</h2>
    <p>Thank you for visiting <strong>${businessName}</strong> for your recent <em>${service}</em>. We hope you had a wonderful experience!</p>
    <p>Could you take 30 seconds to share your feedback on Google? It helps us grow and serve you better.</p>
    <a href="${trackingLink}" class="btn">⭐ Leave a Google Review</a>
    <p style="font-size:13px;color:#888;">Or copy this link: <a href="${trackingLink}">${trackingLink}</a></p>
    <div class="footer">
      You received this because you recently visited ${businessName}.<br>
      <a href="#">Unsubscribe</a>
    </div>
  </div>
</body>
</html>`;

  const info = await transporter.sendMail({
    from: `"${process.env.EMAIL_FROM_NAME}" <${process.env.EMAIL_FROM}>`,
    to,
    subject: `${customerName}, your review means the world to us ⭐`,
    html,
  });

  logger.info(`Email sent to ${to}: ${info.messageId}`);
  return info;
};