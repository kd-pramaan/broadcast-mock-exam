# Broadcast Mock Exam

Registration, payment-gated activation, and mock-exam delivery for a one-time
cohort of broadcast engineering exam candidates (under 5,000 applicants, one
exam cycle). See `/docs` or the architecture doc shared separately for the
full design rationale - this README is just setup.

Stack: Next.js (App Router, API routes as the backend) + Postgres (Prisma) +
an email API. No separate backend service, no domain required - it runs on
the free `*.vercel.app` subdomain Vercel gives every project.

## 1. Local setup

```
npm install
cp .env.example .env     # then fill in DATABASE_URL at minimum
npx prisma db push       # creates the tables from prisma/schema.prisma
npm run seed              # creates 1 admin user + 1 sample exam
npm run dev
```

Get a free `DATABASE_URL` from [Neon](https://neon.tech) or
[Supabase](https://supabase.com) - either works, no credit card needed at
this scale. Paste the connection string into `.env`.

Leave `RESEND_API_KEY` blank for local dev: verification and activation
emails are logged to the terminal instead of sent, with the real link, so you
can click it yourself without setting up an email account.

The seeded admin login is printed by `npm run seed` (defaults to
`admin@example.com` / `changeme123` unless you set `ADMIN_EMAIL` /
`ADMIN_PASSWORD` in `.env` first).

## 2. Before go-live

- **Replace `public/qr-code.png`** with your real UPI/payment QR code image -
  the one currently there is a labeled placeholder.
- **Add real exam questions.** Either extend `prisma/seed.js` and re-run
  `npm run seed`, or insert rows into the `Exam` table directly (`questions`
  is a JSON array of `{ id, text, options: string[], correctIndex, marks }`).
- **Set `SESSION_SECRET`** to a random 32+ character string in production
  (used to sign the login cookie).
- **Get a `RESEND_API_KEY`** (or swap `lib/email.js` for Brevo/another
  provider) once you're sending real verification emails. Resend's free tier
  is 3,000/month but capped at 100/day - fine for a steady trickle of
  registrations, worth checking if many people will register on the same day.

## 3. Deploy (no domain needed)

1. Push this repo to GitHub (already wired to `origin`).
2. Import it in [Vercel](https://vercel.com) - it auto-detects Next.js.
3. Add the same environment variables from `.env` in the Vercel project
   settings (`DATABASE_URL`, `SESSION_SECRET`, `RESEND_API_KEY`, `EMAIL_FROM`,
   `APP_URL` - set `APP_URL` to the `*.vercel.app` URL Vercel assigns you).
4. Deploy. Run `npx prisma db push` and `npm run seed` once against the
   production `DATABASE_URL` (from your machine, or a one-off Vercel deploy
   hook) to create tables and the admin account.

Cost at this scale: $0/month on Vercel Hobby + Neon/Supabase free tier. See
the architecture doc for the full breakdown.

## 4. How the registration gate works

`pending_verification` (just registered) -> `pending_payment` (clicked email
link, set a password) -> `pending_approval` (submitted payment reference) ->
`active` (admin clicked Activate at `/admin`, after checking the bank
statement offline). Only `active` users can reach `/dashboard` and `/exams`.

## 5. Tests

`lib/scoring.js` is the one piece of logic where a bug would matter (a wrong
score). Run its test with:

```
npm test
```
