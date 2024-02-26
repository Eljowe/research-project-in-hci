import { GoogleGenerativeAI } from "@google/generative-ai";
import { GoogleGenerativeAIStream, Message, StreamingTextResponse } from "ai";
import { VertexAI, HarmCategory, HarmBlockThreshold } from "@google-cloud/vertexai";

export async function GET(request: Request) {
  // This is a test route to check if the API is reachable
  return new Response(JSON.stringify({ body: "ok" }), {
    status: 200,
    statusText: "Hello from route gemini/GET",
  });
}

export const runtime = "edge";

const project = "hci-research-project";
const location = "europe-north1";
const textModel = "gemini-1.0-pro";
const visionModel = "gemini-1.0-pro-vision";

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
  const vertexai = new VertexAI({ project: project, location: location });
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

    const filePart = { file_data: { file_uri: `data:image/jpeg;base64,${base64Data}`, mime_type: "image/png" } };
    const request = {
      contents: [{ role: "user", parts: [{ text: prompt.toString() }, filePart] }],
    };
    const response = await vertexModel.generateContentStream(request);

    // @ts-ignore
    const stream = GoogleGenerativeAIStream(response);

    const streamingResponse = new StreamingTextResponse(stream);

    return streamingResponse;
  } catch (error) {
    return new Response(JSON.stringify({ Message: "Failed" }), { status: 500 });
  }
};
