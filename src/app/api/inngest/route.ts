import { serve } from "inngest/next";
import { inngest } from "@/services/inngest/client";
import {
  processWhatsappMessage,
  followUpCron,
  processFollowUpJob,
  bufferMonitorWorker,
  manualContentGenerate,
  processContentJob,
  startCampaign,
  sendReviewRequestJob,
  reviewAutopollCron,
  processReviewAutopollJob,
  publishScheduledPostsCron,
  processPublishPostJob,
  generateAuditJob,
  reviewSyncWorker,
  processReviewSyncJob,
  criticalAlertWorker,
  scheduleLeadFollowUpsJob,
  dispatchWhatsappFollowUpJob
} from "@/services/inngest/functions";

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [
    processWhatsappMessage,
    followUpCron,
    processFollowUpJob,
    bufferMonitorWorker,
    manualContentGenerate,
    processContentJob,
    startCampaign,
    sendReviewRequestJob,
    reviewAutopollCron,
    processReviewAutopollJob,
    publishScheduledPostsCron,
    processPublishPostJob,
    generateAuditJob,
    reviewSyncWorker,
    processReviewSyncJob,
    criticalAlertWorker,
    scheduleLeadFollowUpsJob,
    dispatchWhatsappFollowUpJob
  ],
});
