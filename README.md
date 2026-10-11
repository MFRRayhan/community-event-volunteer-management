# Community Event & Volunteer Management Platform

A production-ready community event and volunteer coordination web application built with **Next.js App Router (JavaScript / JSX)**, **Tailwind CSS**, **Native MongoDB Driver**, **NextAuth**, and **Google Gemini AI**.

---

## 🌟 Project Overview

The Community Event & Volunteer Management Platform connects social initiative organizers with passionate community volunteers. Organizers can draft, manage, and monitor events, leverage AI to generate rich descriptions and role recommendations, and analyze participation with visual analytics. Volunteers can discover events, filter by categories and skills, register for tailored shifts, and manage their participation history.

---

## 🚀 Key Features

1. **Authentication**:
   - Secure account registration and sign-in via NextAuth Credentials Provider.
   - Salted password hashing with `bcryptjs`.
   - Client and server-side input validation.

2. **Role-Based Authorization**:
   - Distinct roles: `organizer` and `volunteer`.
   - Protected server actions, API routes, and App Router pages.
   - Dedicated dashboards tailored to each role's responsibilities.

3. **Event Management**:
   - Full CRUD event lifecycle for organizers (Draft, Published, Closed, Completed).
   - Real-time volunteer capacity tracking and schedule deadline management.
   - Self-service volunteer roster with inline attendance status updating (`registered`, `confirmed`, `attended`, `cancelled`).

4. **Volunteer Registration**:
   - Skill-based volunteer shift selection.
   - Compound unique index (`{ eventId: 1, volunteerId: 1 }`) in MongoDB preventing duplicate sign-ups.
   - Live available slots counter calculation: `maxCapacity - activeCount` (cancelled registrations do not reduce available capacity).
   - Self-service cancellation with instant capacity release.

5. **Search & Discovery**:
   - Public event discovery page (`/events`) with live debounced search by title and description.
   - Filtering by category (Environment, Education, Health, Crisis Relief, etc.) and location.
   - Timeframe filter (Upcoming, Past, All).

6. **AI Event Description Assistant**:
   - Powered by Google Gemini (`gemini-1.5-flash` / `gemini-3.8-flash` via `@google/generative-ai`).
   - Generates structured JSON containing title, multi-paragraph mission overview, suggested roles, required volunteer skills, and outreach copy.
   - One-click "Apply to Form" directly pre-fills the event creation form.

7. **Organizer Analytics**:
   - Interactive charts built with **Recharts**:
     - *Events by Category*: Bar chart showing initiative distribution across focus areas.
     - *Volunteer Capacity & Sign-ups*: Comparison of active sign-ups vs. maximum capacity.
     - *Status Breakdown*: Donut chart depicting registration status distributions.
   - Summary metric cards for total initiatives, active sign-ups, total capacity, and utilization rate.

8. **Theme Customization & UI/UX**:
   - Dark and Light mode toggle with persistent user preference in `localStorage`.
   - Fully responsive layout for Mobile, Tablet, and Desktop.
   - Accessible modals, confirmation dialogs, empty states, and loading spinners.

---

## 🔐 Authentication Strategy

Authentication is implemented using **NextAuth.js v4** supporting both **Credentials Provider** and **Google OAuth Provider** with stateless **JWT sessions**:

### 1. Credentials Authentication
- **Registration**: When a user registers (`src/actions/auth.actions.js`), their password is encrypted using `bcryptjs.hash()` and stored in the `users` collection alongside their chosen role (`organizer` or `volunteer`).
- **Sign In**: Credentials are verified against MongoDB using `bcryptjs.compare()`.

### 2. Google OAuth 2.0 Integration
- **Provider**: Google OAuth is configured via `GoogleProvider` in `src/auth.js`.
- **Database Handling**:
  - In the NextAuth `signIn` callback, when a user signs in with Google, their email is checked against MongoDB's `users` collection.
  - **New Google Users**: A new document is automatically created in the `users` collection with `role: "volunteer"`, `provider: "google"`, `name`, `email`, `image`, and `createdAt: new Date()`. No password is stored.
  - **Existing Users**: If an account with the same email already exists (e.g. an existing organizer or volunteer), the user logs in normally and their existing role is strictly preserved.
- **Session & JWT Enrichment**:
  - The JWT token contains `token.id`, `token.email`, `token.role`, and `token.image`.
  - The client and server session expose `session.user.id`, `session.user.email`, `session.user.role`, and `session.user.image`.
  - Role-based route protection continues to operate seamlessly for both Credentials and Google users.

### 3. Google OAuth Setup Instructions
To set up Google OAuth for local development or production:
1. Go to the [Google Cloud Console](https://console.cloud.google.com/).
2. Create or select an existing project.
3. Navigate to **APIs & Services > Credentials**.
4. Configure the **OAuth Consent Screen** (User Type: External, fill in app name and support email).
5. Create credentials: **Create Credentials > OAuth client ID > Web application**.
6. Set **Authorized JavaScript origins**:
   - `http://localhost:3000` (for local development)
   - `https://your-domain.vercel.app` (for production)
7. Set **Authorized redirect URIs**:
   - `http://localhost:3000/api/auth/callback/google`
   - `https://your-domain.vercel.app/api/auth/callback/google`
8. Copy the **Client ID** and **Client Secret** into your `.env.local`:
   ```env
   GOOGLE_CLIENT_ID=your_google_client_id_here
   GOOGLE_CLIENT_SECRET=your_google_client_secret_here
   ```

---

## 🎨 Theme Customization & Light/Dark Mode

The theme system is built with **`next-themes`** and **Tailwind CSS v4**:

- **System Theme Detection**: Automatically respects system OS dark/light preferences out of the box.
- **Persistent Storage**: Preferences are remembered across browser sessions in `localStorage`.
- **Tailwind v4 Compatibility**: Configured with `@custom-variant dark (&:where(.dark, .dark *));` in `src/app/globals.css`.
- **No Flash of Unstyled Theme**: Managed cleanly with `suppressHydrationWarning` and `defaultTheme="system"`.
- **ThemeToggle Component**:
  - Interactive button switching between Light and Dark mode.
  - Utilizes `react-icons` (`FiSun` and `FiMoon`) with accessible labels.
  - Available across all public pages, authentication pages, organizer dashboards, and volunteer dashboards.

---

## 🔑 Environment Variables

Create a `.env.local` file in the project root:

```env
# MongoDB Atlas Connection String
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/community_platform?retryWrites=true&w=majority

# NextAuth Secret (Generate via: openssl rand -base64 32)
NEXTAUTH_SECRET=your_nextauth_secret_key_here

# Application Base URL
NEXTAUTH_URL=http://localhost:3000

# Google OAuth Credentials (from Google Cloud Console)
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here

# Google Gemini API Key (Obtain from https://aistudio.google.com/)
GEMINI_API_KEY=your_gemini_api_key_here
```

---

## 💻 Local Setup & Installation

### Prerequisites
- Node.js 18.17+ or Node.js 20+
- MongoDB database (local or MongoDB Atlas)

### Step 1: Clone and Install
```bash
git clone <repository-url>
cd community-event-volunteer-management
npm install
```

### Step 2: Configure Environment
Copy `.env.example` to `.env.local` and add your MongoDB, NextAuth, and Gemini credentials:
```bash
cp .env.example .env.local
```

### Step 3: Run the Development Server
```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🚀 Deployment (Vercel)

1. Push your code to a GitHub repository.
2. Go to [Vercel Dashboard](https://vercel.com/) and click **"Add New Project"**.
3. Import your GitHub repository.
4. In the **Environment Variables** section, configure:
   - `MONGODB_URI`
   - `NEXTAUTH_SECRET`
   - `NEXTAUTH_URL` (set to your Vercel deployment URL, e.g. `https://your-project.vercel.app`)
   - `GEMINI_API_KEY`
5. Click **"Deploy"**.

---

## 👤 Demo Credentials

For quick evaluation, testing, and grading, the following pre-configured demo accounts are available:

| Role | Email | Password | Pre-seeded Permissions |
| :--- | :--- | :--- | :--- |
| **Organizer** | `organizer@community.org` | `Password123` | Create, edit, publish events, review volunteers, access analytics |
| **Volunteer** | `volunteer@community.org` | `Password123` | Browse published events, register for shifts, cancel shifts, volunteer dashboard |

> [!NOTE]
> Demo passwords are encrypted using `bcryptjs` with salt rounds 10. Passwords are never stored in plaintext.
> If you need to re-seed or restore these accounts at any time, run:
> ```bash
> node restore-demo-users.mjs
> ```

---

## 🛠️ Verification Scripts

- **Lint Check**: `npm run lint`
- **Production Build**: `npm run build`
