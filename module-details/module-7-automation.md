# Module 7: n8n Automation Layer

## 1. Module Overview
The n8n Automation Layer acts as the orchestrator for long-running workflows, drip campaigns, and scheduled events outside the scope of Next.js synchronous requests. By decoupling workflow state logic from the Next.js API, the system achieves massive scalability. 

## 2. Architecture
- **Frontend Structure**: N/A
- **Backend Structure**: 
  - Exposes internal webhook endpoints (like `/api/cron/auto-generate` and `/api/reviews/monitor`) that n8n can call on a schedule.
  - Generates outgoing webhook calls (e.g., from `src/app/api/webhook/twilio/route.ts`) to hit n8n Catch Webhook nodes.
- **Service Layer**: N/A
- **Database**: 
  - `AutomationLog` is occasionally used to track events triggered by external services.

## 3. APIs Used
- **Internal APIs (Called by n8n)**: 
  - `POST /api/cron/auto-generate`
  - `POST /api/reviews/monitor`
- **External APIs (Called by Next.js)**: 
  - `N8N_WEBHOOK_URL`: Used by the WhatsApp AI Agent when it detects a `LEAD_CAPTURED` or `HUMAN_HANDOFF` event.

## 4. MongoDB/Mongoose Structure
- N/A natively, n8n interacts with the system via REST APIs, which subsequently update Mongoose schemas.

## 5. AI Integrations
- n8n relies entirely on the Next.js Groq services for AI. It does not invoke AI nodes natively; instead, it triggers the Next.js routes which house the strictly formatted LLM prompts.

## 6. Automation & n8n Workflows
- **Triggers Configured in Next.js**:
  1. **LEAD_CAPTURED**: When the AI agent extracts a lead's name and interest, it sends a payload `{ event: 'FOLLOW_UP', phone, name, interest, source }` to n8n to start a drip campaign.
  2. **HUMAN_HANDOFF**: If the AI detects it cannot answer a question, it sends `{ event: 'HUMAN_HANDOFF', phone, conversationHistory }` to n8n, which can be configured to alert a human via Slack or Email.
- **Expected n8n Workflows**:
  1. **Daily Scheduler Trigger**: A cron node that hits the `auto-generate` API.
  2. **Hourly Review Monitor Trigger**: A cron node that hits the `monitor` API.
  3. **Lead Drip Campaign**: Receives the `FOLLOW_UP` webhook, waits 2 days, and hits Twilio to send a follow-up WhatsApp message.

## 7. UI/UX Components
- None native to Next.js. Requires logging into the external n8n self-hosted or cloud instance.

## 8. Environment Variables Needed
```env
N8N_WEBHOOK_URL=http://localhost:5678/webhook/...
```

## 9. Execution/Setup Guide
1. Host an instance of n8n.
2. Build workflows with Catch Webhook nodes matching the payloads dispatched by `src/app/api/webhook/twilio/route.ts`.
3. Build Cron trigger nodes that send POST requests to the local Next.js instance using the `CRON_SECRET`.

## 10. Module Dependencies
- **Depends on**: Next.js API Routes for data.
- **Depended upon by**: WhatsApp Agent (for drip campaigns) and Scheduler (for Cron execution).

## 11. Known Issues / Technical Debt
- **Missing Workflow JSONs**: The actual n8n workflow definitions (`.json` exports) are not stored in the repository. If the external n8n server crashes, there is no infrastructure-as-code (IaC) backup of the logic.
- **Fire-and-Forget Webhooks**: The `axios.post` calls in the Twilio webhook use `.catch()` for errors but do not retry if n8n is down. If n8n drops a connection, the `LEAD_CAPTURED` event is lost forever.

## 12. Future Scaling Suggestions
- **Retry Mechanisms**: Implement BullMQ or a similar queue in Next.js to reliably dispatch webhooks to n8n with exponential backoff.
- **Version Control Workflows**: Export all n8n workflows and commit them to a `workflows/` directory in this repository to maintain IaC principles.
