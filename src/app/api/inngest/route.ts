import { serve } from "inngest/next";
import { inngest } from "@/services/inngest/client";
import {
  processWhatsappMessage,
  followUpCron,
  processFollowUpJob,
  generateContentCron,
  processContentJob,
  startCampaign,
  sendReviewRequestJob,
  reviewAutopollCron,
  processReviewAutopollJob
} from "@/services/inngest/functions";

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [
    processWhatsappMessage,
    followUpCron,
    processFollowUpJob,
    generateContentCron,
    processContentJob,
    startCampaign,
    sendReviewRequestJob,
    reviewAutopollCron,
    processReviewAutopollJob
  ],
});
