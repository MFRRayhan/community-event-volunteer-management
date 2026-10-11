# Manual Actions & Environment Configuration

This document tracks all external setups, credentials, and manual operations required to run and deploy the **Community Event & Volunteer Management Platform** (Programming Hero Scope).

> **Note**: Never commit sensitive secrets to source control. Always use `.env.local` with your own credentials.

---

## 1. Environment Variables Configuration

Create a `.env.local` file in the project root with the following placeholders:

```env
# ==============================================================================
# APP CORE CONFIGURATION
# ==============================================================================
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=<YOUR_NEXTAUTH_SECRET_KEY>

# ==============================================================================
# DATABASE (MONGODB ATLAS)
# ==============================================================================
# Obtain from MongoDB Atlas cluster connect dialog (Node.js driver)
MONGODB_URI=<YOUR_MONGODB_ATLAS_CONNECTION_STRING>
MONGODB_DB_NAME=<YOUR_DATABASE_NAME_E_G_COMMUNITY_EVENTS>

# ==============================================================================
# ARTIFICIAL INTELLIGENCE PROVIDER (GOOGLE GEMINI)
# ==============================================================================
# Obtain from Google AI Studio (https://aistudio.google.com/)
GEMINI_API_KEY=<YOUR_GOOGLE_GEMINI_API_KEY>
```

---

## 2. External Service Setup Procedures

### Step 2.1: Generate NextAuth Secret
Run the following in your terminal to generate a secure random string:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```
Or with OpenSSL:
```bash
openssl rand -base64 32
```
Paste the output into `NEXTAUTH_SECRET`.

### Step 2.2: MongoDB Atlas Database Provisioning
1. Log in to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Create a Free Cluster (M0 Sandbox).
3. Under **Database Access**, create a user with read/write access.
4. Under **Network Access**, add IP `0.0.0.0/0` (allow access from anywhere for development/Vercel) or your current IP.
5. Click **Connect** -> **Drivers** -> Copy the connection string into `MONGODB_URI`.
6. Ensure collection unique indexes exist:
   - `users`: `{ email: 1 }` (unique)
   - `registrations`: `{ eventId: 1, volunteerId: 1 }` (unique compound index to prevent duplicate registration for the same event)

### Step 2.3: Google Gemini API Key Setup
1. Go to [Google AI Studio](https://aistudio.google.com/).
2. Click **Get API key** -> **Create API key in new project**.
3. Copy the key to `GEMINI_API_KEY` in `.env.local`.

---

## 3. Deployment Checklist

| Step | Action | Status | Notes |
|---|---|---|---|
| 1 | Set `NEXTAUTH_URL`, `NEXTAUTH_SECRET`, `MONGODB_URI`, `GEMINI_API_KEY` on Vercel | Pending | Environment Variables tab |
| 2 | Whitelist `0.0.0.0/0` in MongoDB Atlas Network Access | Pending | Required for Vercel dynamic IPs |
| 3 | Run `npm run build` locally to verify zero build errors | Pending | TypeScript & Tailwind build check |
