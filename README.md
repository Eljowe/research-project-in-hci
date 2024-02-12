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

![user interface](/public/full_ui.JPG)
User interface

## LLM API configuration

This tool has been tested with local LLMs running at `localhost:1234` and openAI api at `https://api.openai.com/v1`. The GPT-4 works when adding `OPENAI_API_KEY` to `.env.local`, and setting `USE_GPT=true` at `app/api/imageupload/route.ts`

Local LLM models can be run with [LM Studio](https://lmstudio.ai/) which supports at least the following modded multimodal models: [BakLLaVA-1-GGUF](https://huggingface.co/abetlen/BakLLaVA-1-GGUF/tree/main), [obsidian-3b-multimodal-q6-gguf](https://huggingface.co/nisten/obsidian-3b-multimodal-q6-gguf), and [liuhaotian_llava-v1.5-13b-GGUF](https://huggingface.co/PsiPi/liuhaotian_llava-v1.5-13b-GGUF)

<!-- HTML syntax -->
<p align="center">
  <img src="/public/test_tui.png" width="40%" style="max-width: 300px;" alt="test input image">

  <img src="/public/Capture.JPG" width="40%" style="max-width: 300px;" alt="test output image">
</p>
Above images are the test input (left) and the output (right). Above example was produced with GPT-4-vision-preview model.