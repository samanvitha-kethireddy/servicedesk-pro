# ServiceDesk Pro — IT Helpdesk & Asset Management

Enterprise-grade MERN capstone: ticket lifecycle management, SLA automation,
asset tracking, knowledge base, RBAC, audit logging, and AI-powered ticket
classification (Groq + Llama 3.3).

## Stack
- **Backend**: Node.js, Express, MongoDB (Mongoose), JWT auth
- **Frontend**: React (Vite), Tailwind CSS, Recharts
- **AI**: groq-sdk (openai/gpt-oss-120b, fallback openai/gpt-oss-20b)
- **Deploy**: Render (backend) + Vercel (frontend)

## Local Setup

### Backend
```bash
cd backend
cp .env   # fill in MONGO_URI, JWT_SECRET, GROQ_API_KEY
npm install
npm run dev
```

### Frontend
```bash
cd frontend
cp .env   # set VITE_API_BASE_URL
npm install
npm run dev
```

## Roles
System Admin · IT Manager · Technician · Employee · Asset Manager

## Core Modules
- Ticket Lifecycle (Open → In Progress → On Hold → Resolved → Closed/Reopened)
- SLA Timers + Auto-Escalation (cron job, every 5 min by default)
- Asset Lifecycle (In Stock → Assigned → Maintenance/Retired)
- Knowledge Base (Draft/Published/Archived + AI recommendations)
- Audit Logging (immutable, append-only)
- AI Ticket Classification + KB Matching (Groq)

