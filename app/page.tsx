"use client";
import { useState, useEffect } from "react";

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [prompt, setPrompt] = useState<string | null>(null);
  const [generatedOutput, setGeneratedOutput] = useState<string | null>(null);
  const [modelOnline, setModelOnline] = useState<boolean>(false);
  const [imageSrc, setImageSrc] = useState<string | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setFile(event.target.files[0]);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageSrc(reader.result as string);
      };

      reader.readAsDataURL(event.target.files[0]);
    }
  };

  useEffect(() => {
    const checkModel = async () => {
      try {
        const response = await fetch("http://localhost:1234/v1/models");
        if (response.ok) {
          setModelOnline(true);
        }
      } catch (error) {
        setModelOnline(false);
      }
    };
    checkModel();
  }, []);

  const handlePromptChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setPrompt(event.target.value);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    if (file) {
      var data = null;
      if (!prompt) {
        const defaultPrompt = `Identify the elements present in the given UI screenshot. Please provide all the buttons, text fields, images, and any other visible components in HTML format. Try to provide full HTML code of the UI in the image.`;
        data = await uploadImage(file, defaultPrompt);
      } else {
        data = await uploadImage(file, prompt);
      }
      console.log(data);
      setGeneratedOutput(data.generatedResponse);
      console.log(data.generatedResponse);
    }
    setLoading(false);
  };

  async function uploadImage(file: File, prompt: string) {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("prompt", prompt);

    const response = await fetch("/api/imageupload", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error("Image upload failed");
    } else {
      const data = await response.json();
      if (data.saveImage) {
        setUploadedImage(data.filename);
      }
      return data;
    }
  }

  return (
    <main className="w-[100%] justify-center flex-col flex min-h-screen text-black bg-[#fffafa] p-6">
      <div className="w-[100%] h-min flex justify-center items-center flex-col">
        {loading && <h1 className="text-blue-500 text-2xl sticky top-1/2 left-1/2 animate-pulse">Loading...</h1>}
        <div className="min-w-[350px] w-[100%] max-w-[700px] h-min max-h-[800px] space-y-2 flex flex-col m-2 border p-4">
          {modelOnline ? (
            <h1 className="text-green-500">Model is online</h1>
          ) : (
            <h1 className="text-red-500">Model is offline</h1>
          )}
          <form onSubmit={handleSubmit}>
            <label className="mb-2 inline-block text-neutral-900 ">Input image</label>
            <input
              className="relative m-0 block w-full min-w-0 flex-auto rounded border border-solid border-neutral-300 bg-clip-padding px-3 py-[0.32rem] text-base font-normal transition duration-300 ease-in-out file:-mx-3 file:-my-[0.32rem] file:overflow-hidden file:rounded-none file:border-0 file:border-solid file:border-inherit file:bg-neutral-100 file:px-3 file:py-[0.32rem] file file:transition file:duration-150 file:ease-in-out file:[border-inline-end-width:1px] file:[margin-inline-end:0.75rem] hover:file:bg-neutral-300 cursor-pointer focus:border-primary focus focus:shadow-te-primary focus:outline-none "
              type="file"
              id="formFile"
              accept="image/jpeg, image/png, image/jpg"
              onChange={handleFileChange}
            />
            <textarea
              onChange={handlePromptChange}
              rows={10}
              placeholder={`Identify the elements present in the given UI screenshot. Please provide all the buttons, text fields, images, and any other visible components in HTML format. Try to provide full HTML code of the UI in the image.
              `}
              className="w-[100%] my-2 bg-inherit rounded-md border p-2"
            />
            {loading == true || !file || !modelOnline ? (
              <input
                type="submit"
                value="Submit"
                disabled
                className="cursor-not-allowed bg-neutral-300 mt-2 rounded p-2 border"
              />
            ) : (
              <input
                type="submit"
                value="Submit"
                className="cursor-pointer bg-blue-500 text-white hover:bg-blue-400 mt-2 rounded p-2 border"
              />
            )}
          </form>
        </div>
        <div className="min-w-[350px] w-[100%] max-w-[700px] h-min space-y-2 flex flex-col m-2 border p-4">
          <p>Selected image:</p>
          {imageSrc && !uploadedImage ? (
            <img src={imageSrc} className="object-contain h-[60%] max-h-[400px]" alt="Selected image" />
          ) : null}
          {uploadedImage && (
            <img
              alt="UI screenshot"
              className="object-contain h-[60%] max-h-[400px]"
              src={`/uploads/${uploadedImage}`}
            />
          )}
        </div>
        <div className="min-w-[350px] max-w-[700px] flex-col w-[100%] m-2 flex border p-4">
          <p>Generated output:</p>
          {generatedOutput && <p className="mt-4 text-neutral-700">{generatedOutput}</p>}
        </div>
      </div>
    </main>
  );
}
