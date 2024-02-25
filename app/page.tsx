"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import hljs from "highlight.js";
import "highlight.js/styles/vs2015.css";
import purify from "dompurify";
import CollapsibleContainer from "./components/CollapsibleContainer";

const DEFAULT_PROMPT = `Identify every visible user interface element in the provided mobile UI screenshot, including buttons, text fields, images, labels, and other components. Generate a concise HTML layout with styling, strictly focusing on structural elements and styling attributes. Maintain the original aspect ratio and set the correct width and height in pixels for each element. If a search icon is detected, represent it with a same-size grey container labeled "Search Icon" (without src attributes), ensuring it's not misinterpreted as a search bar. Replace other images, logos, and icons with similar grey containers. Exclude any unnecessary accompanying text or comments. No stretching or distortion is allowed. Estimate the device width and height realistically and use them as constraining constants. Wrap the UI in a div to emulate the original aspect ratio. Do not use position: absolute or position: fixed. Respond only with the generated HTML code.`;
const DEFAULT_ITERATIVE_PROMPT = `Iteratively refine the HTML layout generated in the previous step with a focus on meticulous validation. Verify and correct any positional inconsistencies in terms of size and placement for each user interface element. Identify and include any missing components present in the screenshot. Handle overlapping elements accurately. Maintain the original aspect ratio without stretching or distortion. Represent logos, labels, and images with same-size grey containers. Refine size estimates for precise alignment. Avoid any references to image content, real-life scenarios, or translation. Concentrate solely on the structure and positioning of UI elements. Do not introduce new UI elements. Respond only with the generated HTML code.

Ensure that the refined HTML accurately reflects the layout of the original mobile UI screenshot. Pay careful attention to positional details and correct any discrepancies observed in the first iteration. In the generated HTML code, please use entirely unique class names for the second iteration styles to prevent any interference with the styles from the first iteration.`;

//Code refactoring needed
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
  const [useIterativePrompt, setUseIterativePrompt] = useState<boolean>(false);
  const [iterativePrompt, setIterativePrompt] = useState<string | null>(null);
  const [iterativeOutput, setIterativeOutput] = useState<string | null>(null);

  useEffect(() => {
    // Check if local LLM model is online
    const checkModel = async () => {
      if (!useLocalModel) return;
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
    setIterativeOutput(null);
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
      formData.append("maxTokens", maxTokens != null && maxTokens > 0 ? maxTokens.toString() : "2000");
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
          let fullOutput = "";
          while (true) {
            const { done, value } = await reader.read();
            if (done) {
              console.log("stream completed");
              setLoading(false);
              hljs.highlightAll();
              if (useIterativePrompt) {
                await postIterativePrompt(prompt, formData, fullOutput);
              }
              return done;
            }
            let chunk = new TextDecoder("utf-8").decode(value);
            chunk = chunk.replace(/^data: /, "");
            fullOutput += chunk;
            setGeneratedOutput((prev) => (prev == null ? chunk : prev + chunk));
          }
        };
        processStream().catch((err) => {
          console.log("--stream error--", err);
          return null;
        });
      }
    } catch (error) {
      console.error("Error occured while uploading image: ", error);
      return null;
    }
  }

  async function postIterativePrompt(prompt: string, formData: FormData, fullOutput: string) {
    try {
      setLoading(true);
      if (fullOutput == null) {
        console.error("No previous output to use for iterative prompt");
        setLoading(false);
        return;
      }
      formData.set(
        "prompt",
        `${iterativePrompt ? iterativePrompt : DEFAULT_ITERATIVE_PROMPT}` +
          " Here is the previous prompt: " +
          prompt +
          " Here is the previous output: " +
          fullOutput,
      );
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
              console.log("Iterative stream completed");
              setLoading(false);
              hljs.highlightAll();
              return done;
            }
            let chunk = new TextDecoder("utf-8").decode(value);
            chunk = chunk.replace(/^data: /, "");
            setIterativeOutput((prev) => (prev == null ? chunk : prev + chunk));
          }
        };
        processStream().catch((err) => {
          console.log("--Iterative stream error--", err);
          return null;
        });
      }
    } catch (error) {
      setLoading(false);
      console.error("Error occured while iterative process: ", error);
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
        <div className="m-2 flex h-min w-[100%] min-w-[350px] flex-col space-y-2 rounded-md border border-blue-500 p-4">
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
                  placeholder="Max tokens (1 - 3000, default 2000)"
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
                  placeholder="Temperature (0.001 - 1, default 0.001)"
                  min={0.001}
                  max={1}
                  step="any"
                  id="temperature"
                  onChange={handleTemperatureChange}
                  className="rounded-md border border-neutral-300 bg-inherit p-2"
                />
                <label className="inline-flex w-max cursor-pointer items-center">
                  <span className="me-3 text-sm font-medium text-neutral-900">Use iterative prompting</span>
                  <input
                    type="checkbox"
                    checked={useIterativePrompt}
                    onChange={() => setUseIterativePrompt(!useIterativePrompt)}
                    className="peer sr-only"
                    id="useLocalModel"
                  />
                  <div className="peer relative h-6 w-11 rounded-full bg-gray-200 after:absolute after:start-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-green-600 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rtl:peer-checked:after:-translate-x-full dark:border-gray-600 dark:bg-gray-700 dark:peer-focus:ring-blue-800"></div>
                </label>
                <div>
                  <span>Prompt:</span>
                  <textarea
                    onChange={(e) => setPrompt(e.target.value)}
                    rows={10}
                    placeholder={`${DEFAULT_PROMPT}`}
                    id="prompt"
                    className="w-[100%] rounded-md border border-neutral-300 bg-inherit p-2"
                  />
                </div>
                {useIterativePrompt && (
                  <div>
                    <span>Iterative prompt:</span>
                    <textarea
                      onChange={(e) => setIterativePrompt(e.target.value)}
                      rows={10}
                      placeholder={`${DEFAULT_ITERATIVE_PROMPT}`}
                      id="prompt"
                      className="w-[100%] rounded-md border border-neutral-300 bg-inherit p-2"
                    />
                  </div>
                )}
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
        <div className="flex w-full flex-wrap justify-center gap-2">
          <div
            className={`ml-0 flex ${useIterativePrompt ? "w-full md:w-[calc(50%-4px)]" : "w-full"} min-w-[350px] flex-col rounded-md border p-4`}
          >
            <p>Generated layout:</p>
            {generatedOutput && (
              <div className="mt-4" dangerouslySetInnerHTML={{ __html: purify.sanitize(generatedOutput) }} />
            )}
          </div>
          {useIterativePrompt && (
            <div className="flex w-full min-w-[350px] flex-col rounded-md border p-4 md:w-[calc(50%-4px)]">
              <p>Iterative layout:</p>
              {iterativeOutput && (
                <div className="mt-4" dangerouslySetInnerHTML={{ __html: purify.sanitize(iterativeOutput) }} />
              )}
            </div>
          )}
        </div>
        {generatedOutput && (
          <CollapsibleContainer title="Generated text output">
            <pre>
              <code id="codeblock" className={`hljs html`}>
                {purify.sanitize(generatedOutput)}
              </code>
            </pre>{" "}
          </CollapsibleContainer>
        )}
      </div>
      {iterativeOutput && (
        <CollapsibleContainer title="Iterative text output">
          <pre>
            <code id="codeblock" className={`hljs html`}>
              {purify.sanitize(iterativeOutput)}
            </code>
          </pre>
        </CollapsibleContainer>
      )}
      {loading && (
        <div className="sticky bottom-5 left-[calc(100%-16px)] flex h-min w-min items-center justify-center rounded-full bg-black bg-opacity-5 p-2 backdrop-blur-sm">
          <div
            className="text-primary inline-block h-10 w-10 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] text-blue-600 motion-reduce:animate-[spin_1.5s_linear_infinite]"
            role="status"
          >
            <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">
              Loading...
            </span>
          </div>
        </div>
      )}
    </main>
  );
}
