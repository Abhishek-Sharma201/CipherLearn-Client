This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Environment Setup

Before running the application, you need to configure your environment variables:

1. **Copy the example environment file:**
   ```bash
   cp .env.example .env.local
   ```

2. **Update the environment variables** in `.env.local` according to your setup:

   | Variable | Description | Default Value |
   |----------|-------------|---------------|
   | `NEXT_PUBLIC_API_URL` | Backend API base URL (with `/api` suffix) | `http://localhost:5000/api` |
   | `NEXT_PUBLIC_BACKEND_URL` | Backend base URL (without `/api` suffix) | `http://localhost:5000` |

3. **For production deployment**, update these variables to point to your actual backend server:
   ```env
   NEXT_PUBLIC_API_URL=https://api.yourapp.com/api
   NEXT_PUBLIC_BACKEND_URL=https://api.yourapp.com
   ```

> **Note:** Variables prefixed with `NEXT_PUBLIC_` are embedded in the browser bundle at build time. Never store sensitive secrets in these variables.

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
