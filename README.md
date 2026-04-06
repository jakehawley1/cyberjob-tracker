# CyberJob Tracker

A full-stack job search tracker built for cybersecurity / compliance job seekers. Track every application, score your resume against job descriptions using AI, and get weekly email digests — accessible from any device.

---

## Features

- Track applications with status, salary, source, tags, notes, resume version
- One-click status updates (Applied → Interview → Finalist → Offer / Rejected)
- Timeline history for every job
- AI resume scorer — paste a job description + your resume, get a % match and specific feedback
- Weekly email digest of active applications (automated via Vercel cron)
- Curated job board searches for compliance/GRC/NIST/SFS roles
- Works on phone and desktop
- Dark mode support

---

## Setup (takes about 20 minutes total)

### Step 1 — Clone and install

```bash
git clone https://github.com/YOUR_USERNAME/cyberjob-tracker.git
cd cyberjob-tracker
npm install
```

---

### Step 2 — Create your Supabase database (free)

1. Go to [supabase.com](https://supabase.com) and create a free account
2. Click **New project** — name it `cyberjob-tracker`, pick any region, set a password
3. Wait ~2 minutes for it to provision
4. Go to **SQL Editor** (left sidebar) and paste the contents of `supabase-schema.sql`, then click **Run**
5. Go to **Settings → API** and copy:
   - `Project URL` → this is your `NEXT_PUBLIC_SUPABASE_URL`
   - `anon` `public` key → this is your `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` `secret` key → this is your `SUPABASE_SERVICE_ROLE_KEY`

---

### Step 3 — Get your Anthropic API key (for resume scoring)

1. Go to [console.anthropic.com](https://console.anthropic.com)
2. Sign in and go to **API Keys**
3. Click **Create Key**, name it `cyberjob-tracker`
4. Copy the key → this is your `ANTHROPIC_API_KEY`

> Note: You'll need credits on your Anthropic account. Resume scoring uses Claude claude-sonnet-4-6 and costs fractions of a cent per score.

---

### Step 4 — Get your Resend API key (for email alerts)

1. Go to [resend.com](https://resend.com) and create a free account
2. Go to **API Keys → Create API Key**
3. Copy the key → this is your `RESEND_API_KEY`

> The free tier allows 3,000 emails/month — more than enough.

---

### Step 5 — Set up environment variables locally

```bash
cp .env.local.example .env.local
```

Open `.env.local` and fill in all the values:

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
ANTHROPIC_API_KEY=sk-ant-...
RESEND_API_KEY=re_...
ALERT_EMAIL=your@email.com
```

---

### Step 6 — Run locally to test

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — the app should load. Add a test job, try the resume scorer.

---

### Step 7 — Push to GitHub

```bash
git add .
git commit -m "Initial commit"
git push origin main
```

---

### Step 8 — Deploy to Vercel (free)

1. Go to [vercel.com](https://vercel.com) and sign in with your GitHub account
2. Click **Add New → Project**
3. Select your `cyberjob-tracker` repository
4. Click **Environment Variables** and add each variable from your `.env.local`:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `ANTHROPIC_API_KEY`
   - `RESEND_API_KEY`
   - `ALERT_EMAIL`
5. Click **Deploy**

Vercel will build and deploy in ~2 minutes. You'll get a URL like `https://cyberjob-tracker-xyz.vercel.app`.

**That URL works on your phone.** Bookmark it.

---

## Weekly email alerts

The app is configured to automatically email you every Monday at 9am with a digest of all your active applications. This is handled by Vercel's cron job system (configured in `vercel.json`) — no extra setup needed once deployed.

To manually trigger a digest any time, visit:
```
https://your-app-url.vercel.app/api/alerts
```

---

## Using the resume scorer

1. Find a job posting you're applying to
2. Add it to your tracker
3. Click the job card to open the detail panel
4. Click **"Score my resume against this job"**
5. Paste the full job description text
6. Paste your resume text (plain text, not PDF)
7. Click **Score match** — you'll get a % match and specific feedback in seconds

The score is saved to the job record so you can track it over time.

---

## Future improvements (DIY)

- **Add login**: Supabase has built-in auth — add `@supabase/auth-helpers-nextjs` to lock the app to your account
- **Mobile app**: The site is mobile-friendly already, but you can add it to your phone's home screen as a PWA
- **Job scraping**: Use a service like SerpAPI or Apify to auto-pull new postings matching your criteria
- **Calendar integration**: Add interview dates to Google Calendar via their API

---

## Tech stack

| Layer | Tool |
|-------|------|
| Framework | Next.js 14 (App Router) |
| Database | Supabase (Postgres) |
| AI scoring | Anthropic Claude API |
| Email | Resend |
| Hosting | Vercel |
| Styling | CSS Modules |

---

## File structure

```
cyberjob-tracker/
├── app/
│   ├── api/
│   │   ├── jobs/route.ts          # CRUD API for job records
│   │   ├── resume-score/route.ts  # Claude resume scoring API
│   │   └── alerts/route.ts        # Email digest API + cron endpoint
│   ├── dashboard/
│   │   ├── page.tsx               # Main dashboard
│   │   └── dashboard.module.css
│   ├── globals.css
│   └── layout.tsx
├── components/
│   ├── JobForm.tsx                 # Add/edit job modal
│   ├── JobCard.tsx                 # Job list item
│   ├── JobDetail.tsx               # Detail panel + resume scorer
│   ├── MatchFinder.tsx             # Curated job searches
│   └── StatsBar.tsx                # Application stats
├── lib/
│   └── supabase.ts                 # Supabase client + types
├── supabase-schema.sql             # Run this in Supabase SQL editor
├── vercel.json                     # Cron job config
└── .env.local.example              # Environment variable template
```
trigger
