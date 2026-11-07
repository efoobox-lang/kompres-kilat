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

## AI Employee production setup

AI Employee actions require server-side credentials and persistent storage; they fail explicitly when a required integration is missing.

1. Copy `.env.example` to `.env.local` for local development. Set `ADMIN_PASSWORD` (at least 12 characters), `ADMIN_SESSION_SECRET` (at least 32 characters), `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, and `GEMINI_API_KEY`. Keep these values in the hosting provider's secret manager in production; never expose them with a `NEXT_PUBLIC_` prefix.
2. Apply [`scripts/sql/ai-employees-schema.sql`](./scripts/sql/ai-employees-schema.sql) to the Supabase project. It creates persistent AI task/draft/video records, analytics event storage, metrics RPC, and the video bucket.
3. Configure `GOOGLE_VIDEO_MODEL` only for a Gemini video model enabled for the project's account and billing. Video generation also requires the Supabase bucket created by the SQL setup.
4. Configure Instagram's business-account credentials for Reels publishing. Instagram requires an HTTPS video URL reachable by Meta. Facebook text publishing is optional and requires `FACEBOOK_PAGE_ID` plus a Page Access Token.
5. Deploy with HTTPS, then verify admin login, task generation/history, draft persistence, analytics event collection, video-job polling, and each social publisher independently before enabling them for users.

Hermes3D forwarding is optional and disabled by default. Enable `HERMES3D_ENABLE_PRODUCTION=true` only when its configured endpoint, agent, and integration token are backed by a verified production service.

### Integration boundaries

- AI tasks and drafts are stored in Supabase; model output is not proof that an external action occurred.
- Analytics reports only events collected by this application. Google Search Console, AdSense, sales, uptime, server latency, and runtime CPU/memory monitoring are not connected and are shown as unavailable.
- Facebook publishing currently supports text posts. Instagram publishing requires a real generated video; there is no sample-media fallback.
- The virtual office is a visual interface, not a persistent agent runtime. Its huddle/lounge visuals do not start workers, train models, or represent live infrastructure telemetry.

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
