"use client";
import { useState, useEffect } from "react";
import Image from "next/image";

const DEFAULT_PROMPT = `Identify every element present in the given UI screenshot. Please provide all the buttons, text fields, images, and any other visible components. Return a HTML layout with styling, that would result in an UI resembling the original image with corresponding element sizes and user interface aspect ratio. You don't need to implement any javascript functionality, just the visual aspects of the UI. You can replace images, logos and icons with same-size grey divs. It is important you include every element you detect in the final result. It is also important that the elements are the correct size, for this you should set the correct width and height styling in pixels. Estimate the device width and height in pixels and wrap the UI in a div with the same width and height in order to emulate the original aspect ratio, these values should also act as the constraining constants, no element should be wider or taller than these values. Don't use position: absolute or position: fixed for any elements. Return HTML with styling.`;

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploadedImagePath, setUploadedImagePath] = useState<string | null>(null);
  const [prompt, setPrompt] = useState<string | null>(null);
  const [generatedOutput, setGeneratedOutput] = useState<string | null>(null);
  const [modelOnlineStatus, setModelOnlineStatus] = useState<boolean>(false);
  const [temporaryImageFile, setTemporaryImageFile] = useState<string | null>(null);
  const [errorAlert, setErrorAlert] = useState<boolean>(false);
  const [developerMode, setDeveloperMode] = useState<boolean>(false);

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

  const toggleDeveloperMode = () => {
    setDeveloperMode(!developerMode);
  };

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
    }
    setLoading(false);
  };

  async function uploadImage(file: File, prompt: string) {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("prompt", prompt);
    try {
      const response = await fetch("/api/openai", {
        method: "POST",
        body: formData,
      });
      if (!response.ok) {
        setErrorAlert(true);
        setLoading(false);
        return;
      } else {
        const reader = response.body!.getReader();
        const processStream = async () => {
          while (true) {
            // .read() returns 2 properties
            const { done, value } = await reader.read();

            if (done) {
              console.log("stream completed");
              setLoading(false);
              break;
            }
            let chunk = new TextDecoder("utf-8").decode(value);

            chunk = chunk.replace(/^data: /, "");

            setGeneratedOutput((prev) => (prev == null ? chunk : prev + chunk));
          }
        };
        processStream().catch((err) => console.log("--stream error--", err));
      }
    } catch (error) {
      console.error("Error occured while uploading image: ", error);
    }
  }

  return (
    <main className="justify-star flex min-h-screen w-[100%] flex-col bg-[#fffafa] px-4 py-2 text-black">
      <div className="flex h-min w-[100%] flex-col items-center justify-center">
        <div className="flex w-full flex-row justify-between px-4 py-2">
          {modelOnlineStatus ? (
            <h1 className="text-green-500">Local model is online</h1>
          ) : (
            <h1 className="text-red-500">Local model is offline</h1>
          )}
          <label className="inline-flex cursor-pointer items-center">
            <span className="me-3 text-sm font-medium text-gray-900 dark:text-gray-300">Developer mode</span>
            <input type="checkbox" checked={developerMode} onChange={toggleDeveloperMode} className="peer sr-only" />
            <div className="peer relative h-6 w-11 rounded-full bg-gray-200 after:absolute after:start-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-blue-600 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rtl:peer-checked:after:-translate-x-full dark:border-gray-600 dark:bg-gray-700 dark:peer-focus:ring-blue-800"></div>
          </label>
        </div>
        <div className="m-2 flex h-min max-h-[800px] w-[100%] min-w-[350px] max-w-[700px] flex-col space-y-2 border p-4">
          <form onSubmit={handleSubmit} className="space-y-2">
            <label className="mb-2 inline-block text-neutral-900 ">Input image</label>
            <input
              className="file focus:border-primary focus focus:shadow-te-primary relative m-0 block w-full min-w-0 flex-auto cursor-pointer rounded border border-solid border-neutral-300 bg-clip-padding px-3 py-[0.32rem] text-base font-normal transition duration-300 ease-in-out file:-mx-3 file:-my-[0.32rem] file:overflow-hidden file:rounded-none file:border-0 file:border-solid file:border-inherit file:bg-neutral-100 file:px-3 file:py-[0.32rem] file:transition file:duration-150 file:ease-in-out file:[border-inline-end-width:1px] file:[margin-inline-end:0.75rem] hover:file:bg-neutral-300 focus:outline-none "
              type="file"
              id="formFile"
              accept="image/jpeg, image/png, image/jpg"
              onChange={handleFileChange}
            />
            {developerMode && (
              <textarea
                onChange={handlePromptChange}
                rows={10}
                placeholder={DEFAULT_PROMPT}
                className="w-[100%] rounded-md border bg-inherit p-2"
              />
            )}
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
        <div className="m-2 flex w-[100%] min-w-[350px] max-w-[700px] flex-col overflow-x-scroll border p-4">
          <p>Generated text output:</p>
          {generatedOutput && <p className="mt-4 text-neutral-700">{generatedOutput}</p>}
        </div>
        <div className="m-2 flex w-[100%] min-w-[350px] max-w-[700px] flex-col border p-4">
          <p>Generated layout:</p>
          {generatedOutput && <div className="mt-4" dangerouslySetInnerHTML={{ __html: generatedOutput }} />}
        </div>
      </div>
    </main>
  );
}
