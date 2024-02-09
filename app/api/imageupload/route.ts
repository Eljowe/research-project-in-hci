import path from "path";
import { writeFile } from "fs/promises";
import base64 from "base64-js";

const baseUrl = "http://localhost:1234/v1";
const saveImage = false;

export async function GET(request: Request) {
  return new Response(JSON.stringify({ body: "ok" }), {
    status: 200,
    statusText: "Hello from route imageupload/GET",
  });
}

export const POST = async (req: Request, res: Response) => {
  const formData = await req.formData();

  const file = formData.get("file");
  const prompt = formData.get("prompt");

  if (!file || !(file instanceof File) || !prompt) {
    console.log("No files or prompt received.");
    return new Response(JSON.stringify({ error: "No files received." }), { status: 400 });
  }

  const filename = Date.now() + file.name.replaceAll(" ", "_");

  const testPrompt = `
  Identify and describe all the elements present in the given UI screenshot. 
  Please provide details about buttons, text fields, images, and any other visible components.
  Answer in short, max 30 word answer.
  `;
  try {
    const generatedResponse = await postPromptLLM(prompt as string, file as File);
    if (saveImage) {
      const buffer = Buffer.from(await file.arrayBuffer());
      await writeFile(path.join(process.cwd(), "public/uploads/" + filename), buffer);
    }
    return new Response(
      JSON.stringify({
        Message: "Success",
        filename: filename,
        generatedResponse: generatedResponse,
        saveImage: saveImage,
      }),
      { status: 201 }
    );
  } catch (error) {
    console.log("Error occured ", error);
    return new Response(JSON.stringify({ Message: "Failed" }), { status: 500 });
  }
};

async function postPromptLLM(prompt: string, file: File) {
  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    const base64Data = buffer.toString("base64");
    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        Authorization: "Bearer not-needed",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "local-model",
        messages: [
          {
            role: "system",
            content:
              "You are an automating assistant. You are given a screenshot of an UI and you need to detect UI elements it contains. Always respond in HTML.",
          },
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
    // Add your logic here, for example, sending the base64Data to the server
  } catch (error) {
    console.error(error);
  }
}
