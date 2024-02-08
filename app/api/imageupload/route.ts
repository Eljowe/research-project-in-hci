import path from "path";
import { writeFile } from "fs/promises";

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
  try {
    await writeFile(path.join(process.cwd(), "public/uploads/" + filename), buffer);
    return new Response(JSON.stringify({ Message: "Success", filename: filename }), { status: 201 });
  } catch (error) {
    console.log("Error occured ", error);
    return new Response(JSON.stringify({ Message: "Failed" }), { status: 500 });
  }
};
