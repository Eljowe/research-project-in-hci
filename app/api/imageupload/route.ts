import path from "path";
import { writeFile } from "fs/promises";

const USE_GPT = false;
const SAVE_IMAGE = false;
const MAX_TOKENS = 550;

const TEST_PROMPT = `Identify the elements present in the given UI screenshot. Please provide all the buttons, text fields, images, and any other visible components in HTML format. Try to provide full HTML code of the UI in the image.`;

const API_KEY = USE_GPT ? process.env.OPENAI_API_KEY : "not-needed";
const MODEL = USE_GPT ? "gpt-4-vision-preview" : "local-model";
const BASE_URL = USE_GPT ? "https://api.openai.com/v1/chat/completions" : "http://localhost:1234/v1";

export async function GET(request: Request) {
  // This is a test route to check if the API is reachable
  return new Response(JSON.stringify({ body: "ok" }), {
    status: 200,
    statusText: "Hello from route imageupload/GET",
  });
}

export const POST = async (req: Request, res: Response) => {
  // This is the main route to handle the image upload and prompt submission
  const formData = await req.formData();

  const file = formData.get("file");
  const prompt = formData.get("prompt");

  if (!file || !(file instanceof File) || !prompt) {
    console.log("No files or prompt received.");
    return new Response(JSON.stringify({ error: "No files received." }), { status: 400 });
  }

  const filename = Date.now() + file.name.replaceAll(" ", "_");

  try {
    const generatedResponse = await postPromptLLM(prompt as string, file as File);

    // If there is need to save images in the future
    if (SAVE_IMAGE) {
      const buffer = Buffer.from(await file.arrayBuffer());
      await writeFile(path.join(process.cwd(), "public/uploads/" + filename), buffer);
    }

    if (!generatedResponse) {
      return new Response(
        JSON.stringify({
          Message: "Failed",
          filename: null,
          generatedResponse: null,
          SAVE_IMAGE: null,
        }),
        { status: 500 },
      );
    }

    return new Response(
      JSON.stringify({
        Message: "Success",
        filename: filename,
        generatedResponse: generatedResponse,
        SAVE_IMAGE: SAVE_IMAGE,
      }),
      { status: 201 },
    );
  } catch (error) {
    return new Response(JSON.stringify({ Message: "Failed" }), { status: 500 });
  }
};

async function postPromptLLM(prompt: string, file: File) {
  try {
    //Convert file to base64 because LLM accepts base64 encoded images
    console.log(`
      USE_GPT: ${USE_GPT}
      MODEL: ${MODEL}
      BASE_URL: ${BASE_URL}
    `);
    const buffer = Buffer.from(await file.arrayBuffer());
    const base64Data = buffer.toString("base64");
    const response = await fetch(`${BASE_URL}/chat/completions`, {
      // API payload
      // Will need some changes to make it work with GPT4 API
      method: "POST",
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: prompt },
              {
                type: "image_url",
                image_url: {
                  url: `data:image/jpeg;base64,${base64Data}`,
                },
              },
            ],
          },
        ],
        max_tokens: MAX_TOKENS,
        temperature: 0.001,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error("Error occured while posting prompt to LLM");
  }
}
