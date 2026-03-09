# NutriVegan Setup Guide 🥗

Welcome to the NutriVegan project! This guide will help you set up the development environment and get the application running locally.

## 🚀 Tech Stack

- **Framework:** Next.js 15 (App Router, Turbopack)
- **Database:** Neon PostgreSQL (Direct connection via `pg`)
- **AI Integration:** NVIDIA AI (Meta Llama 3.1) & Google Gemini
- **Authentication:** NextAuth.js
- **Styling:** Tailwind CSS
- **PWA:** `next-pwa`

---

## 📋 Prerequisites

Ensure you have the following installed:
- **Node.js:** v18.0.0 or higher
- **npm:** v9.0.0 or higher
- **Git:** Latest version

---

## 🛠️ Step-by-Step Installation

### 1. Clone the Repository
```bash
git clone https://github.com/mrbombastic-tickman-org/nutri-vegan.git
cd nutri-vegan
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Configuration
Create a `.env.local` file in the root directory and populate it with the following keys. You can use `.env.example` as a template if available.

```env
# --- DATABASE ---
# Provide your Neon PostgreSQL connection string
DATABASE_URL="postgresql://user:password@host/neondb?sslmode=verify-full"
DIRECT_URL="postgresql://user:password@host/neondb?sslmode=verify-full"

# --- AI SERVICES ---
# NVIDIA API key for Llama 3.1 nutrition logic
NVIDIA_API_KEY="your_nvidia_api_key_here"
NVIDIA_BASE_URL="https://integrate.api.nvidia.com/v1"

# Google Gemini API key (Fallback for form analysis)
GOOGLE_API_KEY="your_google_api_key_here"

# --- AUTHENTICATION ---
# Generate a secret: openssl rand -base64 32
NEXTAUTH_SECRET="your_random_secret_here"
NEXTAUTH_URL="http://localhost:3000"
```

### 4. Database Setup (Zero Action Required)
The database is fully managed on Neon. Since you are using a custom `pg` wrapper and the schema is already live on the cloud:
- **Do NOT** run any migrations.
- **Do NOT** run any database initialization commands.

Your existing data and tables (`users`, `categories`, `diet_plans`, etc.) are already available once the `DATABASE_URL` is set.

### 5. Start Development Server
```bash
npm run dev
```
The app will be available at [http://localhost:3000](http://localhost:3000).

---

## 📦 Project Structure

- `/app`: Next.js App Router pages and API routes.
- `/components`: Reusable UI components.
- `/lib`: Core utilities, including the custom database wrapper (`db.ts`).
- `/public`: Static assets and PWA manifest.
- `/contexts`: React Context providers (Theme, etc.).

---

## 🛡️ Available Scripts

- `npm run dev`: Starts development server with Turbopack.
- `npm run build`: Creates an optimized production build.
- `npm run start`: Starts the production server.
- `npm run lint`: Runs ESLint to check for code quality issues.
- `npm run type-check`: Runs TypeScript compiler check.

---

## 🔧 Troubleshooting

- **Database Errors:** Ensure `DATABASE_URL` includes `sslmode=verify-full` as required by Neon.
- **AI Response Issues:** Verify your NVIDIA API key has sufficient credits/quota.
- **NextAuth:** If login fails locally, ensure `NEXTAUTH_URL` matches your local port exactly.
