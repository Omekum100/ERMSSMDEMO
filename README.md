# EMRS Secured Telephone Calling System - Frontend POC

This repository contains a **frontend-only proof of concept** for the **EMRS Secured Telephone Calling System**.

## School-specific scope

The current seed dataset is configured for:

- **Eklavya Model Residential School, Hat Gamharia**
- Village: `Sialjora`
- Panchayat: `Jaipur`
- Block: `Hat Gamharia`
- District: `West Singhbhum`
- PIN: `833214`
- Phone: `8674943374`
- Email: `hatgamhariaemrs@gmail.com`
- Public school page: `https://emrs.jharkhand.gov.in/HatGamharia`

The demo content uses this public school information to shape the branding and seed data. Student and contact records remain demo records for the POC.

## What this POC includes

- Next.js App Router application
- TypeScript + React + Tailwind CSS
- Mock authentication for `ADMIN` and `STUDENT`
- Admin panel for students, contacts, calls, alerts, activity logs, and demo reset
- Student panel for contacts, simulated calling, call history, and alerts
- Mock repository layer backed by browser `localStorage`
- Resettable demo data for presentations
- Simulated calling provider abstraction

## Important limitations

This implementation is **not production secure**.

- Authentication is **mock authentication only**
- Data is stored in **browser localStorage**
- There is **no backend**
- There is **no database**
- There are **no API routes**
- Calls are **simulated only**
- No real phone call is made
- No Twilio, SIP, WebRTC, Prisma, PostgreSQL, MongoDB, Firebase, or Supabase integration exists

## Demo credentials

### Admin
- Username: `admin`
- Password: `Admin@123`
- Security Code: `123456`

### Student
- Username: `raj001`
- Password: `Student@123`
- Security Code: `111111`

## Local storage keys

- `emrs_students`
- `emrs_contacts`
- `emrs_calls`
- `emrs_alerts`
- `emrs_audit_logs`
- `emrs_users`
- `emrs_current_user`
- `emrs_seed_version`

## Architecture

Current POC architecture:

```text
React UI
  Ã¢â€ â€œ
Mock Repository Layer
  Ã¢â€ â€œ
browser localStorage
```

Designed future architecture:

```text
React UI
  Ã¢â€ â€œ
API Repository Layer
  Ã¢â€ â€œ
Next.js backend
  Ã¢â€ â€œ
Database
```

## Main folders

```text
src/
  app/
  components/
  context/
  data/
  hooks/
  lib/
  types/
```

## Assumptions used for the POC

- Public school-site details are used for branding, school context, and seed metadata.
- Individual student records are still demo data because no public student roster is available on the school page.
- Alerts targeted to "All Students" are expanded into per-student alert records for simpler localStorage behavior.
- Student logout shows a demo summary with a fixed session-duration display suitable for the POC.

## Run locally

```bash
npm install
npm run dev
```

Then open:

```text
http://localhost:3000
```

## Validation completed

The following were actually run successfully:

- `npm run typecheck`
- `npm run lint`
- `npm run build`

## Before production, implement at minimum

- Real server-side authentication
- Backend APIs
- Database persistence
- Server-side authorization
- Secure credential storage and hashing
- Real audit infrastructure
- Real calling integration
- Session management beyond localStorage
- Production-grade alert delivery and monitoring

