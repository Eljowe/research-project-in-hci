import path from "path";
import { writeFile } from "fs/promises";

const BASE_URL = "http://localhost:1234/v1";
const SAVE_IMAGE = false;
const TEST_PROMPT = `Identify the elements present in the given UI screenshot. Please provide all the buttons, text fields, images, and any other visible components in HTML format. Try to provide full HTML code of the UI in the image.`;

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
    const buffer = Buffer.from(await file.arrayBuffer());
    const base64Data = buffer.toString("base64");
    const response = await fetch(`${BASE_URL}/chat/completions`, {
      // API payload
      // Will need some changes to make it work with GPT4 API
      method: "POST",
      headers: {
        Authorization: "Bearer not-needed",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "local-model",
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
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error("Error occured while posting prompt to LLM: ");
  }
}
