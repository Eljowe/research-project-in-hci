import OpenAI from "openai";
import { OpenAIStream, StreamingTextResponse } from "ai";

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
  const MAX_TOKENS = formData.get("maxTokens") || 1000;
  const TEMPERATURE = formData.get("temperature") || 0.001;
  var API_KEY = process.env.OPENAI_API_KEY;
  const MODEL = "gpt-4-vision-preview";
  const BASE_URL = "https://api.openai.com/v1";
  if (formData.get("apiKey") != "null") {
    API_KEY = formData.get("apiKey")?.toString();
  }
  if (!API_KEY) {
    return new Response(JSON.stringify({ error: "No API Key found" }), { status: 400 });
  }

  console.log(`
    Model: ${MODEL}
    base URL: ${BASE_URL}
    Max Tokens: ${MAX_TOKENS}
    Temperature: ${TEMPERATURE}
    API Key: ${API_KEY}
  `);

  const openai = new OpenAI({ apiKey: API_KEY, baseURL: BASE_URL });

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
      max_tokens: Number(MAX_TOKENS),
      temperature: Number(TEMPERATURE),
    });
    const stream = OpenAIStream(response);

    const streamingResponse = new StreamingTextResponse(stream);

    return streamingResponse;
  } catch (error) {
    return new Response(JSON.stringify({ Message: "Failed" }), { status: 500 });
  }
};
