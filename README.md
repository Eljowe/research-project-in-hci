Tool to test UI detection with LLM APIs. Built with Next.JS.

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

Open [http://localhost:3000](http://localhost:3000) with your browser to see the UI.

Frontend code is located at `app/page.tsx`.

Backend is located at `app/api/imageupload/route.ts` and can be called at route `/api/imageupload`

## Using LLM API

Currently, this tool has been tested with only local LLMs running at `localhost:1234`. The app should work with replacing the local API url with, for example, GPT-4 vision API, as the API-calls remain the same.
