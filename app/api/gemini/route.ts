import { GoogleGenerativeAI } from "@google/generative-ai";
import { GoogleGenerativeAIStream, Message, StreamingTextResponse } from "ai";

export async function GET(request: Request) {
  // This is a test route to check if the API is reachable
  return new Response(JSON.stringify({ body: "ok" }), {
    status: 200,
    statusText: "Hello from route gemini/GET",
  });
}

export const runtime = "edge";

export const POST = async (req: Request, res: Response) => {
  // This is the main route to handle the image upload and prompt submission
  const formData = await req.formData();

  const file = formData.get("file") as File;
  const prompt = formData.get("prompt");
  const use_local = formData.get("useLocalModel");
  const MAX_TOKENS = formData.get("maxTokens") || 1000;
  const TEMPERATURE = formData.get("temperature") || 0.001;

  const USE_GPT = use_local !== "true";

  const API_KEY = USE_GPT ? process.env.GEMINI_API_KEY : "not-needed";
  const MODEL = USE_GPT ? "gpt-4-vision-preview" : "local-model";
  const BASE_URL = USE_GPT ? "https://api.openai.com/v1" : "http://localhost:1234/v1";

  console.log(`
  Use Local Model: ${use_local}
  Model: ${MODEL}
  base URL: ${BASE_URL}
  Max Tokens: ${MAX_TOKENS}
  Temperature: ${TEMPERATURE}

`);

  const genAI = new GoogleGenerativeAI("YOUR-API-KEY-HERE");
  const geminiModel = genAI.getGenerativeModel({ model: "gemini-pro-vision" });

  if (!file || !prompt) {
    console.log("No files or prompt received.");
    return new Response(JSON.stringify({ error: "No files received." }), { status: 400 });
  }

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    const base64Data = buffer.toString("base64");

    const image = {
      inlineData: {
        data: base64Data,
        mimeType: "image/png",
      },
    };

    const response = await geminiModel.generateContentStream([prompt.toString(), image]);
    const stream = GoogleGenerativeAIStream(response);

    const streamingResponse = new StreamingTextResponse(stream);

    return streamingResponse;
  } catch (error) {
    return new Response(JSON.stringify({ Message: "Failed" }), { status: 500 });
  }
};
