UI detection with LLM models. Built with Next.js.

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

Frontend code is located at `/app`.

Current backend API-calls are located at `app/api/openai/route.ts` and can be called at route `/api/openai`

## Using this tool

The workflow is following:

1. Select image file (png, jpg, jpeg should work)
2. Write prompt (if left empty, the example prompt is used) and press `submit`
3. Wait until the loading indicator has disappeared
4. Check results. Currently, the UI shows the LLM response in text format, and the HTML "replication".

## Developer mode

Developer mode allows changing prompts and configuring max tokens and temperature variables. It also allows to try iterative prompting mode, where user can submit two prompts to try and improve the UI element detection accuracy iteratively. This mode sends two API calls with the following contents:

1. Image file and first prompt.
2. Image file, second prompt, first prompt, and the output of the first API call.

## LLM API configuration

This tool has been tested with local LLMs running at `localhost:1234` and openAI api at `https://api.openai.com/v1`. The GPT-4-vision model is selected by default, but user can switch to local model by selecting `use local model` toggle in the developer mode and running local LLM with [LM Studio](https://lmstudio.ai/).

[LM Studio](https://lmstudio.ai/) supports at least the following modded multimodal models: [BakLLaVA-1-GGUF](https://huggingface.co/abetlen/BakLLaVA-1-GGUF/tree/main), [obsidian-3b-multimodal-q6-gguf](https://huggingface.co/nisten/obsidian-3b-multimodal-q6-gguf), and [liuhaotian_llava-v1.5-13b-GGUF](https://huggingface.co/PsiPi/liuhaotian_llava-v1.5-13b-GGUF)
