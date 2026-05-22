<<<<<<< HEAD
# AI Content Scheduler 

AI-powered content scheduling platform for businesses to generate, manage, review, and schedule content for Google Business Profiles and social platforms.

## Features

- User Authentication (JWT)
- Business Profile Management
- AI Content Generation
- Content Approval Workflow
- Post Scheduling System
- Dashboard Analytics
- Pending / Approved / Scheduled Posts Tracking
- Responsive Modern UI
- Google OAuth Integration (publishing module planned)

## Tech Stack

### Frontend
- React
- Vite
- Tailwind CSS
- Axios

### Backend
- Node.js
- Express.js
- Prisma ORM
- PostgreSQL (NeonDB)
- JWT Authentication

## Database

- PostgreSQL
- Prisma migrations

## Project Structure

```txt
content_scheduler/
│
├── backend/
│   ├── prisma/
│   ├── src/
│   └── .env.example
│
├── frontend/
│   ├── src/
│   └── .env.example
│
└── README.md
```

## Installation

Clone repository:

```bash
git clone <repository-url>
```

Backend setup:

```bash
cd backend
npm install
npx prisma generate
npx prisma migrate dev
npm run dev
```

Frontend setup:

```bash
cd frontend
npm install
npm run dev
```

## Environment Variables

Backend `.env`

```env
DATABASE_URL=

JWT_SECRET=

GROQ_API_KEY=

GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_REDIRECT_URI=

SESSION_SECRET=
```

Frontend `.env`

```env
VITE_API_URL=http://localhost:5000/api
```

## Current Status

Completed:
- Authentication
- Business Profile Management
- Dashboard
- AI Content Generation
- Approval Workflow
- Scheduling Logic

Planned:
- Google Business Profile Publishing
- Multi-platform posting
- SaaS deployment

## Author

Vaishnavi Nimse
=======
# GMBBoost AI 🚀

A modern, premium SaaS platform for local businesses to optimize their Google Business Profiles, automate content posting, manage reviews, and convert leads using AI + WhatsApp automation.

![GMBBoost AI Banner](https://images.unsplash.com/photo-1664575602276-acd073f104c1?auto=format&fit=crop&q=80&w=2070)

## ✨ Features

- **AI WhatsApp Lead Conversion Agent**: Conversational AI assistant that qualifies leads, answers questions, and extracts business intelligence.
- **Intelligent CRM Dashboard**: A robust lead management pipeline with AI-driven qualification statuses, intent scoring, and dynamic kanban boards.
- **Automated AI Follow-Ups**: Chronological background jobs that automatically reach out to cold leads at 24h, 3d, and 7d intervals.
- **AI Appointment Booking**: Conversational workflows that detect high intent and dynamically schedule demos or discovery calls.
- **AI GMB Audit Engine**: Instant analysis and optimization of your Google Business Profile.
- **AI SEO Content Generator**: Automatically generates hyper-local posts that rank.
- **Real-Time Data Analytics**: Advanced visual funnels for tracking booking success rates, lead urgency, and pipeline conversion probability.

## 🛠️ Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router)
- **Database**: [MongoDB Atlas](https://www.mongodb.com/atlas) with Mongoose ODM
- **AI Engine**: [Groq API](https://groq.com/) (Llama 3.3 70b)
- **Communication**: [Twilio WhatsApp Sandbox](https://www.twilio.com/docs/whatsapp) + TwiML
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **UI Components**: [ShadCN](https://ui.shadcn.com/) / [Lucide React](https://lucide.dev/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Drag & Drop**: [@dnd-kit](https://dndkit.com/)

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- MongoDB URI
- Twilio Account SID & Auth Token
- Groq / OpenAI API Key

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/gmb-boost-ai.git
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Setup Environment Variables:
   Create a `.env.local` file in the root directory:
   ```env
   MONGODB_URI=your_mongodb_uri
   GROQ_API_KEY=your_groq_api_key
   TWILIO_ACCOUNT_SID=your_twilio_sid
   TWILIO_AUTH_TOKEN=your_twilio_auth_token
   TWILIO_WHATSAPP_NUMBER=your_twilio_number
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   CRON_SECRET=your_cron_secret
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Setup Webhook (For WhatsApp Integration):
   - Expose your local port via Ngrok: `ngrok http 3000`
   - Paste `https://<your-ngrok-url>.ngrok.app/api/webhook/twilio` into your Twilio Sandbox Webhook configuration.

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🔑 Test Credentials

For evaluation purposes, use the following credentials to access the dashboard:

- **Email**: `admin@gmbboost.ai`
- **Password**: `password123`

## 🏗️ Architecture & Modules

### 🧠 AI Extraction Engine
When a user chats via WhatsApp, the webhook processes the message, queries the AI for a response, and asynchronously runs an extraction pipeline (`extractLeadInsights`). This structures unstructured chat data into measurable JSON data (`intentScore`, `businessType`, `budget`, `urgency`), instantly populating the CRM.

### 🔄 Anti-Loop Webhook
The platform utilizes robust TwiML XML responses instead of manual outbound clients, successfully thwarting Twilio API exhaustion, duplicated events, and recursive AI fallbacks.

## 🎨 Design Philosophy

GMBBoost AI follows a **"Futuristic SaaS"** aesthetic, emphasizing:
- **Glassmorphism**: Subtle translucent layers and backdrop blurs.
- **Vibrant Gradients**: Purple and blue neon highlights.
- **Data-Dense Dashboards**: Dynamic cards, tracking badges, and glowing "Hot Lead" borders.
- **Dark Mode First**: Optimized for high-growth AI startup presentation.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
>>>>>>> CRM-system
