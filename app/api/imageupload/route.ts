import path from "path";
import { writeFile } from "fs/promises";
import fs from "fs";

const baseUrl = "http://localhost:1234/v1";

export async function GET(request: Request) {
  return new Response(JSON.stringify({ body: "ok" }), {
    status: 200,
    statusText: "Bad Request",
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

  const buffer = Buffer.from(await file.arrayBuffer());
  console.log(filename);
  const testPrompt = `
  Identify and describe all the elements present in the given UI screenshot. 
  Please provide details about buttons, text fields, images, and any other visible components.
  `;
  try {
    postPromptLLM(testPrompt as string, file as File);
    await writeFile(path.join(process.cwd(), "public/uploads/" + filename), buffer);
    return new Response(JSON.stringify({ Message: "Success", filename: filename }), { status: 201 });
  } catch (error) {
    console.log("Error occured ", error);
    return new Response(JSON.stringify({ Message: "Failed" }), { status: 500 });
  }
};

async function postPromptLLM(prompt: string, file: File) {
  try {
    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        Authorization: "Bearer not-needed",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "local-model",
        messages: [
          { role: "system", content: "use clear language" },
          { role: "user", content: prompt },
          { role: "user", content: file, image: true }, // Include image data
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log(data.choices[0].message);
  } catch (error) {
    console.error(error);
  }
}
