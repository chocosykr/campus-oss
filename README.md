This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

The frontend and worker are intentionally decoupled — the worker is a long-running Node.js process that can't run on Vercel's serverless infrastructure. Jobs are queued via BullMQ/Redis so submissions are never lost if the worker is temporarily busy.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 16 (App Router), TypeScript, Tailwind CSS |
| Auth | NextAuth.js v4 (GitHub OAuth + credentials) |
| Database | PostgreSQL via Supabase, Prisma ORM |
| Job Queue | BullMQ + Redis |
| Code Execution | Docker (custom images per language) |
| Realtime | Supabase Broadcast |
| Deployment | Vercel (frontend) |

---

## Code Execution

Each submission runs in an isolated Docker container with:

- `--network none` — no internet access
- `--memory 256m` — memory cap
- `--cpus 0.5` — CPU cap
- 5 second timeout per test case
- Non-root user inside container
- Auto-removed after execution

Supported languages: JavaScript, Python, Java, C++

The worker compiles once (for Java/C++) then runs against each test case separately, piping stdin from the test case input and comparing stdout against the expected output.

---

## Repos

| Repo | Description |
|---|---|
| [campus-oss](https://github.com/chocosykr/campus-oss) | Next.js frontend |
| [campus-oss-worker](https://github.com/chocosykr/campus-oss-worker) | Node.js execution worker |

---

## Running Locally

### Prerequisites
- Node.js 20+
- Docker
- Redis

### Frontend
```bash
git clone https://github.com/chocosykr/campus-oss
cd campus-oss
npm install
```

Create `.env.local`:
```env
DATABASE_URL="postgresql://..."
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="..."
AUTH_GITHUB_ID="..."
AUTH_GITHUB_SECRET="..."
NEXT_PUBLIC_SUPABASE_URL="..."
NEXT_PUBLIC_SUPABASE_ANON_KEY="..."
WORKER_URL="http://localhost:3001"
```
```bash
npx prisma generate
npm run dev
```

### Worker
```bash
git clone https://github.com/chocosykr/campus-oss-worker
cd campus-oss-worker
npm install
```

Build Docker images:
```bash
docker build -t code-runner-js ./images/javascript
docker build -t code-runner-py ./images/python
docker build -t code-runner-java ./images/java
docker build -t code-runner-cpp ./images/cpp
```

Start Redis:
```bash
docker run -d --name redis-local -p 6379:6379 redis:alpine
```

Create `.env`:
```env
DATABASE_URL="postgresql://..."
SUPABASE_URL="..."
SUPABASE_SERVICE_ROLE_KEY="..."
REDIS_HOST="localhost"
REDIS_PORT="6379"
```
```bash
npx prisma generate
npx ts-node src/worker.ts
```

---

## Database Schema

Key models: `User`, `Course`, `Enrollment`, `Assignment`, `TestCase`, `Submission`, `Review`

Submissions are upserted — resubmitting overwrites the previous attempt rather than creating duplicate rows.

---

## Note on Deployment

The worker requires Docker-in-Docker to run in production (to spawn sandboxed containers). Railway and most PaaS providers block this for security reasons. The recommended production setup is a VPS (e.g. Hetzner, DigitalOcean) with Docker installed, or Fly.io with machine isolation enabled.

For portfolio demonstration, the worker runs locally while the frontend is deployed on Vercel.