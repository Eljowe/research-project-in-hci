Tool to test UI detection with LLM APIs. Built with Next.JS.

## Getting Started

After cloning the project, remember to run `npm install`

Run the development server:

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

## Using this tool

The workflow is following:

1. Select image file (png, jpg, jpeg should work)
2. Write prompt (or if left empty, use the example prompt) and press `submit`
3. Wait until the loading indicator has disappeared
4. Check results. Currently, the UI shows the LLM response in text format, and the HTML "replication".

## LLM API configuration

Currently, this tool has been tested with only local LLMs running at `localhost:1234`. The app should work when adding `OPENAI_API_KEY` to `.env.local` for GPT-4 vision API, as the API-calls remain the same.

<!-- HTML syntax -->
<p align="center">
  <img src="/public/test_tui.png" width="40%" style="max-width: 300px;" alt="test input image">

  <img src="/public/Capture.jpg" width="40%" style="max-width: 300px;" alt="test output image">
</p>
Above images are the test input (left) and the output (right). Above example was produced with GPT-4-vision-preview model.