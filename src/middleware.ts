import { withAuth } from "next-auth/middleware";

export default withAuth({
  pages: {
    signIn: "/login",
  },
});

export const config = { 
  matcher: [
    "/dashboard/:path*",
    // Note: To protect APIs globally while allowing webhooks to bypass, 
    // it's often better to do session checks directly in the API routes. 
    // We will leave `/api/:path*` out of global middleware to prevent breaking Twilio/Inngest webhooks.
  ]
};
