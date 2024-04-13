import { GoogleGenerativeAIStream, Message, StreamingTextResponse } from "ai";
import { VertexAI, HarmCategory, HarmBlockThreshold } from "@google-cloud/vertexai";

export async function GET(request: Request) {
  // This is a test route to check if the API is reachable
  return new Response(JSON.stringify({ body: "ok" }), {
    status: 200,
    statusText: "Hello from route gemini/GET",
  });
}

const PROJECT_ID = "hci-research-project";
const REGION = "europe-west3";
const visionModel = "gemini-1.5-pro-preview-0409";

export const POST = async (req: Request, res: Response) => {
  // This is the main route to handle the image upload and prompt submission
  const formData = await req.formData();

  const file = formData.get("file") as File;
  const prompt = formData.get("prompt");
  const MAX_TOKENS = formData.get("maxTokens") || 1000;
  const TEMPERATURE = formData.get("temperature") || 0.001;

  const API_KEY = process.env.GEMINI_API_KEY;

  console.log(`
  Model: Gemini
  Max Tokens: ${MAX_TOKENS}
  Temperature: ${TEMPERATURE}

`);
  if (!API_KEY) {
    return new Response(JSON.stringify({ error: "No API Key" }), { status: 400 });
  }
  const vertexai = new VertexAI({ project: PROJECT_ID, location: REGION });
  const vertexModel = vertexai.getGenerativeModel({
    model: visionModel,
    generation_config: { max_output_tokens: Number(MAX_TOKENS) },
  });

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
    const request = {
      contents: [
        {
          role: "user",
          parts: [
            {
              text: prompt,
            },
            {
              inlineData: {
                data: base64Data,
                mimeType: "image/png",
              },
            },
          ],
        },
      ],
    };
    // @ts-ignore
    const response = await vertexModel.generateContent(request);

    const aggregatedResponse = await response.response;
    // Select the text from the response
    const fullTextResponse = aggregatedResponse.candidates[0].content.parts[0].text;

    const streamingResponse = new Response(fullTextResponse);

    return streamingResponse;
  } catch (error) {
    console.log("Error: ", error);
    return new Response(JSON.stringify({ Message: "Failed" }), { status: 500 });
  }
};
