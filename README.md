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