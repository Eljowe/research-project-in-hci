"use client";
import { useState, useEffect } from "react";
import Image from "next/image";

const DEFAULT_PROMPT = `Identify the elements present in the given UI screenshot. Please provide all the buttons, text fields, images, and any other visible components in HTML format. Provide HTML code that would result in an UI resembling the original image. You don't need to implement the functionality of the UI or write javascript functionality, just the structure and layout of the screenshot UI.`;

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploadedImagePath, setUploadedImagePath] = useState<string | null>(null);
  const [prompt, setPrompt] = useState<string | null>(null);
  const [generatedOutput, setGeneratedOutput] = useState<string | null>(null);
  const [modelOnlineStatus, setModelOnlineStatus] = useState<boolean>(false);
  const [temporaryImageFile, setTemporaryImageFile] = useState<string | null>(null);
  const [errorAlert, setErrorAlert] = useState<boolean>(false);

  useEffect(() => {
    // Check if local LLM model is online
    const checkModel = async () => {
      try {
        const response = await fetch("http://localhost:1234/v1/models");
        if (response.ok) {
          setModelOnlineStatus(true);
        }
      } catch (error) {
        setModelOnlineStatus(false);
      }
    };
    checkModel();
  }, []);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setErrorAlert(false);
      setFile(event.target.files[0]);
      const reader = new FileReader();
      reader.onloadend = () => {
        setTemporaryImageFile(reader.result as string);
      };

      reader.readAsDataURL(event.target.files[0]);
    }
  };

  const handlePromptChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setPrompt(event.target.value);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorAlert(false);
    setLoading(true);
    setGeneratedOutput(null);
    if (file) {
      var data = null;
      if (!prompt) {
        data = await uploadImage(file, DEFAULT_PROMPT);
      } else {
        data = await uploadImage(file, prompt);
      }
      if (data) {
        setGeneratedOutput(data.generatedResponse);
      }
    }
    setLoading(false);
  };

  async function uploadImage(file: File, prompt: string) {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("prompt", prompt);
    try {
      const response = await fetch("/api/imageupload", {
        method: "POST",
        body: formData,
      });
      if (!response.ok) {
        setErrorAlert(true);
        setLoading(false);
        return;
      }
      const data = await response.json();
      if (data.saveImage) {
        setUploadedImagePath(data.filename);
      }
      return data;
    } catch (error) {
      console.error("Error occured while uploading image: ", error);
    }
  }

  return (
    <main className="flex min-h-screen w-[100%] flex-col justify-center bg-[#fffafa] px-4 py-2 text-black">
      <div className="flex h-min w-[100%] flex-col items-center justify-center">
        <div className="m-2 flex h-min max-h-[800px] w-[100%] min-w-[350px] max-w-[700px] flex-col space-y-2 border p-4">
          {modelOnlineStatus ? (
            <h1 className="text-green-500">Local model is online</h1>
          ) : (
            <h1 className="text-red-500">Local model is offline</h1>
          )}
          <form onSubmit={handleSubmit}>
            <label className="mb-2 inline-block text-neutral-900 ">Input image</label>
            <input
              className="file focus:border-primary focus focus:shadow-te-primary relative m-0 block w-full min-w-0 flex-auto cursor-pointer rounded border border-solid border-neutral-300 bg-clip-padding px-3 py-[0.32rem] text-base font-normal transition duration-300 ease-in-out file:-mx-3 file:-my-[0.32rem] file:overflow-hidden file:rounded-none file:border-0 file:border-solid file:border-inherit file:bg-neutral-100 file:px-3 file:py-[0.32rem] file:transition file:duration-150 file:ease-in-out file:[border-inline-end-width:1px] file:[margin-inline-end:0.75rem] hover:file:bg-neutral-300 focus:outline-none "
              type="file"
              id="formFile"
              accept="image/jpeg, image/png, image/jpg"
              onChange={handleFileChange}
            />
            <textarea
              onChange={handlePromptChange}
              rows={10}
              placeholder={DEFAULT_PROMPT}
              className="my-2 w-[100%] rounded-md border bg-inherit p-2"
            />
            {loading == true || !file ? (
              <input
                type="submit"
                value="Submit"
                disabled
                className="cursor-not-allowed rounded border bg-neutral-300 p-2"
              />
            ) : (
              <input
                type="submit"
                value="Submit"
                className="cursor-pointer rounded border bg-blue-500 p-2 text-white hover:bg-blue-400"
              />
            )}
          </form>
          {errorAlert && (
            <div className="relative rounded border border-red-400 bg-red-100 px-4 py-3 text-red-700" role="alert">
              <strong className="font-bold">Error!</strong>
              <span className="block sm:inline"> Something went wrong while processing the image.</span>
            </div>
          )}
          {loading && (
            <div
              className="relative animate-pulse rounded border border-blue-400 bg-blue-100 px-4 py-3 text-blue-700"
              role="alert"
            >
              <strong className="font-bold">Loading</strong>
              <span className="block sm:inline"> Waiting for response from api.</span>
            </div>
          )}
        </div>
        <div className="m-2 flex h-min w-[100%] min-w-[350px] max-w-[700px] flex-col space-y-2 border p-4">
          <p>Selected image:</p>
          {temporaryImageFile && !uploadedImagePath ? (
            <Image
              width={600}
              height={600}
              src={temporaryImageFile}
              className="mx-auto h-[60%] max-h-[400px] object-contain"
              alt="UI screenshot"
            />
          ) : null}
          {uploadedImagePath && (
            <Image
              width={600}
              height={600}
              alt="UI screenshot"
              className="mx-auto h-[60%] max-h-[400px] object-contain"
              src={`/uploads/${uploadedImagePath}`}
            />
          )}
        </div>
        <div className="m-2 flex w-[100%] min-w-[350px] max-w-[700px] flex-col border p-4">
          <p>Generated text output:</p>
          {generatedOutput && <p className="mt-4 text-neutral-700">{generatedOutput}</p>}
        </div>
        <div className="m-2 flex w-[100%] min-w-[350px] max-w-[700px] flex-col border p-4">
          <p>Generated layout:</p>
          {generatedOutput && <div dangerouslySetInnerHTML={{ __html: generatedOutput }} />}
        </div>
      </div>
    </main>
  );
}
