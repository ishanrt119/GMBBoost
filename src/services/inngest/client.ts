import { Inngest } from "inngest";

// Define the shape of our events for type safety
type Events = {
  "whatsapp/incoming": {
    data: {
      messageSid: string;
      from: string;
      body: string;
      profileName: string;
      numMedia: number;
    };
  };
  "scheduler/generate": {
    data: { businessId: string };
  };
  "scheduler/follow-up": {
    data: { leadId: string; reminderType: string };
  };
  "scheduler/review-autopoll": {
    data: { requestId: string };
  };
  "campaign/start": {
    data: { campaignId: string };
  };
  "campaign/send-review-request": {
    data: { campaignId: string; customerId: string };
  };
  "scheduler/publish-post": {
    data: { postId: string };
  };
};

export const inngest = new Inngest({ id: "gmb-optimization-platform", schemas: { events: {} as Events } });
