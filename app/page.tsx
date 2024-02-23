"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import hljs from "highlight.js";
import "highlight.js/styles/vs2015.css";
import purify from "dompurify";

const DEFAULT_PROMPT = `Identify every element present in the given UI screenshot. Please provide all the buttons, text fields, images, labels, and any other visible components. Return an HTML layout with styling, that would result in an UI resembling the original image with corresponding element sizes and user interface aspect ratio. You don't need to implement any javascript functionality, just the visual aspects of the UI. You can replace images, logos, and icons with same-size grey containers labeled with the component's name, do not add src attributes. It is important you include every element and text you detect in the final result and nothing additional. It is also important that the elements are the correct size, for this you should set the correct width and height styling in pixels. Estimate the device width and height in pixels as accurately and realistically as possible, and wrap the UI in a div with the same width and height in order to emulate the original aspect ratio, these values should also act as the constraining constants, no element should be wider or taller than these values. You are inspecting a mobile UI. Don't use position: absolute or position: fixed for any elements. Respond only in HTML with styling. This task is for evaluating the capabilities of LLM models in UI detection.`;

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [prompt, setPrompt] = useState<string | null>(null);
  const [generatedOutput, setGeneratedOutput] = useState<string | null>(null);
  const [modelOnlineStatus, setModelOnlineStatus] = useState<boolean>(false);
  const [temporaryImageFile, setTemporaryImageFile] = useState<string | null>(null);
  const [errorAlert, setErrorAlert] = useState<boolean>(false);
  const [developerMode, setDeveloperMode] = useState<boolean>(false);
  const [useLocalModel, setUseLocalModel] = useState<boolean>(false);
  const [maxTokens, setMaxTokens] = useState<number | null>(null);
  const [temperature, setTemperature] = useState<number | null>(null);

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
  }, [useLocalModel]);

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

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorAlert(false);
    setLoading(true);
    setGeneratedOutput(null);
    if (file) {
      var data = null;
      if (!prompt) {
        data = await postImageAndPrompt(file, DEFAULT_PROMPT);
      } else {
        data = await postImageAndPrompt(file, prompt);
      }
    }
  };

  async function postImageAndPrompt(file: File, prompt: string) {
    const formData = new FormData();
    try {
      formData.append("file", file);
      formData.append("prompt", prompt);
      formData.append("useLocalModel", useLocalModel.toString());
      formData.append("maxTokens", maxTokens != null ? maxTokens.toString() : "1600");
      formData.append("temperature", temperature != null ? temperature.toString() : "0.001");
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
            const { done, value } = await reader.read();
            if (done) {
              console.log("stream completed");
              setLoading(false);
              hljs.highlightAll();
              break;
            }
            let chunk = new TextDecoder("utf-8").decode(value);
            chunk = chunk.replace(/^data: /, "");
            setGeneratedOutput((prev) => (prev == null ? chunk : prev + chunk));
          }
        };
        processStream().catch((err) => {
          console.log("--stream error--", err);
          return null;
        });
        return generatedOutput;
      }
    } catch (error) {
      console.error("Error occured while uploading image: ", error);
      return null;
    }
  }

  const handleTemperatureChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue: number = parseFloat(event.target.value);
    setTemperature(isNaN(newValue) ? null : newValue);
  };

  return (
    <main className="justify-star flex min-h-screen w-[100%] flex-col bg-[#fffafa] px-4 py-2 text-black">
      <div className="flex h-min w-[100%] flex-col items-center justify-center">
        <div className="flex w-full flex-row justify-end px-4 py-2">
          <label className="inline-flex cursor-pointer items-center">
            <span className="me-3 text-sm font-medium text-gray-900">Developer mode</span>
            <input
              type="checkbox"
              checked={developerMode}
              onChange={() => setDeveloperMode(!developerMode)}
              className="peer sr-only"
            />
            <div className="peer relative h-6 w-11 rounded-full bg-gray-200 after:absolute after:start-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-blue-600 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rtl:peer-checked:after:-translate-x-full dark:border-gray-600 dark:bg-gray-700 dark:peer-focus:ring-blue-800"></div>
          </label>
        </div>
        <div className="m-2 flex h-min max-h-[800px] w-[100%] min-w-[350px] flex-col space-y-2 rounded-md border border-blue-500 p-4">
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
              <div className="flex flex-col space-y-4 pt-4">
                <label className="inline-flex w-max cursor-pointer items-center">
                  <span className="me-3 text-sm font-medium text-neutral-900">Use local model</span>
                  <input
                    type="checkbox"
                    checked={useLocalModel}
                    onChange={() => setUseLocalModel(!useLocalModel)}
                    className="peer sr-only"
                    id="useLocalModel"
                  />
                  <div className="peer relative h-6 w-11 rounded-full bg-gray-200 after:absolute after:start-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-green-600 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rtl:peer-checked:after:-translate-x-full dark:border-gray-600 dark:bg-gray-700 dark:peer-focus:ring-blue-800"></div>
                </label>
                {!modelOnlineStatus && useLocalModel ? <h1 className="text-red-500">Local model is offline</h1> : null}
                <input
                  type="number"
                  placeholder="Max tokens (1 - 3000)"
                  value={maxTokens != null ? maxTokens.toString() : ""} // Convert maxTokens to a string if it's not null
                  min={1}
                  max={3000}
                  id="maxTokens"
                  onChange={(e) => setMaxTokens(parseInt(e.target.value))}
                  className="rounded-md border border-neutral-300 bg-inherit p-2"
                />
                <input
                  type="number"
                  value={temperature != null ? temperature.toString() : ""}
                  placeholder="Temperature (0.001 - 1)"
                  min={0.001}
                  max={1}
                  step="any"
                  id="temperature"
                  onChange={handleTemperatureChange}
                  className="rounded-md border border-neutral-300 bg-inherit p-2"
                />
                <textarea
                  onChange={(e) => setPrompt(e.target.value)}
                  rows={10}
                  placeholder={DEFAULT_PROMPT}
                  id="prompt"
                  className="w-[100%] rounded-md border border-neutral-300 bg-inherit p-2"
                />
              </div>
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
        <div className="m-2 flex h-min w-[100%] min-w-[350px] flex-col space-y-2 rounded-md border p-4">
          <p>Selected image:</p>
          {temporaryImageFile ? (
            <Image
              width={600}
              height={600}
              src={temporaryImageFile}
              className="mx-auto h-[60%] max-h-[400px] object-contain"
              alt="UI screenshot"
            />
          ) : null}
        </div>

        <div className="m-2 flex w-[100%] min-w-[350px] flex-col rounded-md border p-4">
          <p>Generated layout:</p>
          {generatedOutput && (
            <div className="mt-4" dangerouslySetInnerHTML={{ __html: purify.sanitize(generatedOutput) }} />
          )}
        </div>
        <div className="m-2 flex w-[100%] min-w-[350px] flex-col rounded-md border p-4">
          <p>Generated text output:</p>
          {generatedOutput && (
            <pre>
              <code id="codeblock" className={`hljs html`}>
                {purify.sanitize(generatedOutput)}
              </code>
            </pre>
          )}
        </div>
      </div>
    </main>
  );
}
