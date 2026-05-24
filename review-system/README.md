# Module 9 — Customer Upload & Review Generation System

Full-stack production-ready project.
**Stack:** Next.js 14 · Node.js · Express · PostgreSQL · Prisma · Groq LLaMA 3.3 70B

---

## Project Structure

```
review-system/
├── backend/          ← Node.js + Express API
│   ├── prisma/
│   │   ├── schema.prisma   ← Full DB schema
│   │   └── seed.js         ← Demo data seed
│   ├── src/
│   │   ├── controllers/    ← auth, customer, campaign, review, ai, dashboard
│   │   ├── middleware/     ← JWT auth
│   │   ├── routes/         ← All API routes
│   │   ├── services/       ← WhatsApp, Email, SMS integrations
│   │   ├── utils/          ← Prisma client, Logger
│   │   └── index.js        ← Express server
│   ├── .env                ← ⚠️ Fill in your API keys
│   └── package.json
│
└── frontend/         ← Next.js 14 App Router
    ├── src/
    │   ├── app/
    │   │   ├── login/      ← Login + Register
    │   │   ├── dashboard/  ← Live stats dashboard
    │   │   ├── upload/     ← CSV / Manual / CRM
    │   │   ├── campaigns/  ← Create & launch campaigns
    │   │   ├── reviews/    ← Review tracker
    │   │   ├── ai/         ← AI review suggestions (GPT-4o)
    │   │   └── settings/   ← Integration config
    │   ├── components/
    │   │   └── AppLayout.js ← Sidebar nav layout
    │   └── lib/
    │       └── api.js       ← Axios client with JWT refresh
    ├── .env.local
    └── package.json
```

---

## Quick Start

### 1. Prerequisites
- Node.js 18+
- PostgreSQL running locally (or use [Railway](https://railway.app) / [Supabase](https://supabase.com))

### 2. Setup Database

```bash
# Create PostgreSQL database
psql -U postgres -c "CREATE DATABASE review_db;"
```

### 3. Setup Backend

```bash
cd backend

# Install dependencies
npm install

# Copy and fill in your API keys
# Edit .env with your actual keys (see below)

# Run database migrations
npm run db:migrate

# Generate Prisma client
npm run db:generate

# Seed demo data
npm run db:seed

# Start dev server
npm run dev
# → API running at http://localhost:4000
```

### 4. Setup Frontend

```bash
cd frontend

# Install dependencies
npm install

# Start dev server
npm run dev
# → Frontend at http://localhost:3000
```

### 5. Login
- URL: http://localhost:3000/login
- Email: `admin@glamour.com`
- Password: `Admin@1234`

---

## API Keys Required

Edit `backend/.env` and fill in:

| Key | Where to Get |
|-----|-------------|
| `DATABASE_URL` | Your PostgreSQL connection string |
| `GROQ_API_KEY` | https://console.groq.com/keys |
| `WHATSAPP_TOKEN` | https://developers.facebook.com/apps |
| `WHATSAPP_PHONE_NUMBER_ID` | Meta WhatsApp Cloud API |
| `SENDGRID_API_KEY` | https://app.sendgrid.com/settings/api_keys |
| `TWILIO_ACCOUNT_SID` | https://console.twilio.com |
| `TWILIO_AUTH_TOKEN` | https://console.twilio.com |
| `TWILIO_FROM_NUMBER` | Twilio phone number |

> **Note:** The app works without the messaging keys for testing.  
> Only WhatsApp/Email/SMS sending will fail — dashboard, upload, AI suggestions all work.

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register business + admin |
| POST | `/api/auth/login` | Login, returns JWT |
| POST | `/api/auth/refresh` | Refresh access token |
| GET  | `/api/dashboard/stats` | Aggregated dashboard stats |
| GET  | `/api/customers` | List customers (paginated) |
| POST | `/api/customers` | Add customer manually |
| POST | `/api/customers/upload` | Upload CSV file |
| GET  | `/api/campaigns` | List campaigns |
| POST | `/api/campaigns` | Create campaign |
| POST | `/api/campaigns/:id/launch` | Launch & send requests |
| PATCH| `/api/campaigns/:id/pause` | Pause campaign |
| GET  | `/api/reviews` | List reviews |
| GET  | `/api/reviews/stats` | Rating stats |
| POST | `/api/ai/suggestions` | GPT-4o review suggestions |
| POST | `/api/ai/personalize-message` | Personalised message |

---

## CSV Format

Your CSV should have these columns:

```csv
first_name,last_name,phone,email,service,visit_date,channel
Priya,Sharma,+919820011234,priya@mail.com,Hair Cut,2024-12-01,WHATSAPP
Rahul,Mehta,+917010055678,rahul@mail.com,Facial,2024-12-02,EMAIL
```

---

## Deployment

### Backend (Railway / Render)
```bash
# Set environment variables in your hosting dashboard
# Run: npm run db:migrate && npm start
```

### Frontend (Vercel)
```bash
# Set NEXT_PUBLIC_API_URL=https://your-backend.railway.app/api
# Deploy: vercel --prod
```

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14, React 18, Tailwind CSS |
| Backend | Node.js, Express.js |
| Database | PostgreSQL + Prisma ORM |
| Auth | JWT (access + refresh tokens) |
| AI | Groq LLaMA 3.3 70B |
| WhatsApp | Meta WhatsApp Cloud API |
| Email | SendGrid / Nodemailer |
| SMS | Twilio |
| File Upload | Multer + csv-parse |

---

## Why Groq?

Groq uses the OpenAI-compatible API, so **zero code restructuring** was needed.

| Feature | Groq | OpenAI |
|---------|------|--------|
| Speed | ~300 tokens/sec | ~50 tokens/sec |
| Free tier | ✅ Yes | ❌ No |
| API Key URL | https://console.groq.com/keys | https://platform.openai.com |
| Model used | `llama-3.3-70b-versatile` | `gpt-4o` |

### Get your free Groq API key
1. Go to https://console.groq.com/keys
2. Sign up / log in
3. Click **"Create API Key"**
4. Copy the key starting with `gsk_...`
5. Paste it in `backend/.env` as `GROQ_API_KEY=gsk_...`
