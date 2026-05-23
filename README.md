# AI Content Generator – AI GMB Content Suite

AI-powered Google Business Profile content generation platform for local businesses to create, manage, and optimize their local SEO content using AI.

## Features

- Google OAuth Authentication
- Email & Password Authentication with Email Verification
- AI Content Generation (GMB Posts, SEO Descriptions, FAQs, Promotional & Educational posts)
- Real Email Verification (Abstract API + DNS MX fallback)
- Content History with Search & Filters
- Monthly Credit Refill System (50 credits/month)
- Dashboard Analytics
- Business Profile Management
- SEO Score per generated content
- Responsive Modern UI with Framer Motion animations

## Tech Stack

### Frontend
- Next.js 14
- React
- TypeScript
- Tailwind CSS
- Framer Motion
- Supabase JS Client

### Backend
- Node.js
- Express.js
- TypeScript
- Supabase (PostgreSQL + Auth)
- Groq API (LLaMA 3.3 70B)
- JWT Authentication
- Axios

### Database & Auth
- Supabase PostgreSQL
- Supabase Auth (Google OAuth + Email)
- Row Level Security (RLS)

## Project Structure

```
AI Content Generator/
│
├── backend/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── database/
│   │   │   └── schema.sql
│   │   ├── middleware/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── types/
│   │   ├── utils/
│   │   └── validators/
│   └── .env.example
│
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── auth/
│   │   │   │   ├── callback/
│   │   │   │   └── verify/
│   │   │   ├── dashboard/
│   │   │   ├── generator/
│   │   │   ├── history/
│   │   │   ├── login/
│   │   │   ├── profile/
│   │   │   ├── settings/
│   │   │   └── signup/
│   │   ├── hooks/
│   │   ├── lib/
│   │   ├── middleware/
│   │   ├── services/
│   │   ├── types/
│   │   └── utils/
│   └── .env.example
│
└── README.md
```

## Database Setup

1. Go to your Supabase project → **SQL Editor**
2. Copy the entire contents of `backend/src/database/schema.sql`
3. Paste and run it — this creates all tables, policies, indexes, triggers and the monthly credit cron job

## Supabase Auth Configuration

In your Supabase dashboard → **Authentication → URL Configuration**:
- Site URL: `http://localhost:3000`
- Redirect URLs: `http://localhost:3000/auth/callback`

For Google OAuth → **Authentication → Providers → Google**:
- Add your Google OAuth Client ID and Secret
- Authorized redirect URI: `https://your-project.supabase.co/auth/v1/callback`

## Installation

Clone the repository:

```bash
git clone <repository-url>
cd AI Content Generator
```

### Backend Setup

```bash
cd backend
npm install
npm install ws
npm install groq-sdk
npm install axios
```

Create your `.env` file:

```bash
cp .env.example .env
```

Fill in `backend/.env`:

```
PORT=4000
NODE_ENV=development

SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
SUPABASE_ANON_KEY=your_anon_key

GROQ_API_KEY=gsk_your_groq_key

ABSTRACT_EMAIL_API_KEY=your_abstract_api_key

JWT_SECRET=your_minimum_32_character_secret
JWT_EXPIRES_IN=7d

FRONTEND_URL=http://localhost:3000
```

Start the backend:

```bash
npm run dev
```

Backend runs at `http://localhost:4000`

### Frontend Setup

```bash
cd frontend
npm install
```

Create your `.env.local` file:

```bash
cp .env.example .env.local
```

Fill in `frontend/.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_anon_key
NEXT_PUBLIC_API_URL=http://localhost:4000
```

Start the frontend:

```bash
npm run dev
```

Frontend runs at `http://localhost:3000`

## Environment Variables

### Where to find Supabase keys
Go to Supabase Dashboard → **Settings → API**:
- `SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_URL` → Project URL
- `SUPABASE_ANON_KEY` / `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` → anon (public)
- `SUPABASE_SERVICE_ROLE_KEY` → service_role (secret — never expose to frontend)

### Where to find Groq key
- [console.groq.com/keys](https://console.groq.com/keys) → Create API Key

### Where to find Abstract API key
- [app.abstractapi.com/api/email-validation](https://app.abstractapi.com/api/email-validation) → Free tier: 1000/month
- Leave empty to use DNS MX fallback only

## API Routes

### Auth
```
POST /auth/signup
POST /auth/login
POST /auth/logout
POST /auth/google/callback
GET  /auth/verify-email?email=
```

### Content (JWT required)
```
POST /content/generate
POST /content/regenerate
GET  /content/history
DEL  /content/delete/:id
```

### Dashboard (JWT required)
```
GET /dashboard/stats
```

### Profile (JWT required)
```
GET /profile
PUT /profile/update
PUT /profile/password
```

## Current Status

### Completed
- Google OAuth + Email/Password Authentication
- Email Verification Flow
- Real Email Validation (Abstract API + DNS MX)
- AI Content Generation via Groq
- Content History with Search & Filters
- Monthly Credit Refill (50 credits/month via pg_cron)
- Dashboard with Live Stats
- Business Profile Management
- Generator pre-fills from saved profile
- Protected Routes & JWT Middleware
- Session Invalidation on Account Deletion

### Planned
- Stripe Payment Integration
- Higher Credit Plans
- Direct GMB Publishing via Google API
- Multi-location Business Support
- Content Scheduling

## Author

Nandini
