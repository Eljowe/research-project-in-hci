import OpenAI from "openai";
import { OpenAIStream, StreamingTextResponse } from "ai";

const USE_GPT = false;
const MAX_TOKENS = 1000;

const API_KEY = USE_GPT ? process.env.OPENAI_API_KEY : "not-needed";
const MODEL = USE_GPT ? "gpt-4-vision-preview" : "local-model";
const BASE_URL = USE_GPT ? "https://api.openai.com/v1" : "http://localhost:1234/v1";

const openai = new OpenAI({ apiKey: API_KEY, baseURL: BASE_URL });

export async function GET(request: Request) {
  // This is a test route to check if the API is reachable
  return new Response(JSON.stringify({ body: "ok" }), {
    status: 200,
    statusText: "Hello from route openai/GET",
  });
}

export const runtime = "edge";

export const POST = async (req: Request, res: Response) => {
  // This is the main route to handle the image upload and prompt submission
  const formData = await req.formData();

  const file = formData.get("file") as File;
  const prompt = formData.get("prompt");

  if (!file || !prompt) {
    console.log("No files or prompt received.");
    return new Response(JSON.stringify({ error: "No files received." }), { status: 400 });
  }

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    const base64Data = buffer.toString("base64");

    const response = await openai.beta.chat.completions.stream({
      model: MODEL,
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: prompt.toString() },
            {
              type: "image_url",
              image_url: {
                url: `data:image/jpeg;base64,${base64Data}`,
              },
            },
          ],
        },
      ],
      stream: true,
      max_tokens: MAX_TOKENS,
      temperature: 0.001,
    });
    const stream = OpenAIStream(response);

    const streamingResponse = new StreamingTextResponse(stream);

    return streamingResponse;
  } catch (error) {
    return new Response(JSON.stringify({ Message: "Failed" }), { status: 500 });
  }
};
