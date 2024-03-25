"use client";
import { use, useEffect } from "react";
import Image from "next/image";
import purify from "dompurify";
import CollapsibleContainer from "../components/CollapsibleContainer";
import { useStore } from "./store/zustand";
import { postImageAndPrompt } from "../services/promptService";
import LoadingSpinner from "@/components/LoadingSpinner";
import ModelRadioMenu from "@/components/ModelRadioMenu";
import TemperatureSlider from "@/components/TemperatureSlider";
import TokenSlider from "@/components/TokenSlider";
import CopyButton from "@/components/CopyButton";
import ClearPromptButton from "@/components/ClearPromptButton";
import InsertDefaultPromptButton from "@/components/InsertDefaultPromptButton";
import JSONRadioMenu from "@/components/JSONRadioMenu";
import { generateBoundingBoxImage } from "@/services/generateBoundingBoxImage";
import SettingsModal from "@/components/SettingsModal";

//For prompting inspiration: https://github.com/abi/screenshot-to-code/blob/main/backend/prompts/screenshot_system_prompts.py

const DEFAULT_PROMPT = `Identify and meticulously analyze every visible user interface element in the provided mobile UI screenshot. Include buttons, text fields, images, labels, and other components. Generate a precise HTML layout with styling, placing significant emphasis on accuracy. Strictly focus on structural elements and styling attributes.

- Maintain the original aspect ratio and set the correct width and height in pixels for each element.
- For images, use placeholder images from https://placehold.co with the correct sizes.
- The output should contain only the HTML structure and styling.
- No stretching or distortion is allowed. Estimate the device width and height realistically and use them as constraining constants.
- Wrap the UI in a div to emulate the original aspect ratio. Do not use 'position: absolute' or 'position: fixed' for any elements.
- Preserve the original language of any text content without translation. All text found in the image should be included in the response.
- Use custom class names for the HTML elements to prevent interference with future iterations. Append "first-iteration-" as a prefix to each class name.

Your primary focus is on delivering an HTML layout that accurately represents the structure of the original mobile UI screenshot. Respond only with the generated HTML code, do not add HTML markdown or any other reasoning explanations after the code blocks.
`;

const TEST_TAILWIND_PROMPT = `Identify and meticulously analyze every visible user interface element in the provided mobile UI screenshot. Include buttons, text fields, images, labels, and other components. Generate a precise HTML layout with styling, placing significant emphasis on accuracy. Strictly focus on structural elements and styling attributes.

- Use Tailwind for styling.
- Use this script to include Tailwind: <script src="https://cdn.tailwindcss.com"></script>
- Maintain the original aspect ratio and set the correct width and height in pixels for each element.
- For images, use placeholder images from https://placehold.co with the correct sizes.
- The output should contain only the HTML structure and styling.
- No stretching or distortion is allowed. Estimate the device width and height realistically and use them as constraining constants.
- Wrap the UI in a div to emulate the original aspect ratio. Do not use 'position: absolute' or 'position: fixed' for any elements.
- Preserve the original language of any text content without translation. All text found in the image should be included in the response.

Your primary focus is on delivering an HTML layout that accurately represents the structure of the original mobile UI screenshot. Respond only with the generated HTML code, do not add HTML markdown or any other reasoning explanations after the code blocks.
`;

const DEFAULT_ITERATIVE_PROMPT = `In this second iteration, your primary goal remains the substantial improvement of the HTML layout generated in the first attempt. Learn from any inaccuracies or deviations observed in the initial output and focus on rectifying these issues. Carefully validate and adjust the size, placement, and arrangement of each user interface element to more closely match the original mobile UI screenshot.

- Correct any discrepancies in the positioning and sizing of UI components. Pay particular attention to elements that were inaccurately represented in the first attempt.
- Ensure buttons, labels, and other components maintain their intended arrangement. Strive to capture the precise structure observed in the original screenshot.
- Maintain the original aspect ratio without introducing stretching or distortion. Rectify any deviations from the accurate aspect ratio in the first iteration.
- Refine size estimates for all elements for improved precision.
- Avoid the use of 'position: absolute' for any UI element. Elements should flow naturally within the layout.

### Additional Guidance for Complex Styling Replication:

- Try to replicate more complex styling aspects observed in the original screenshot. Pay attention to nuanced details such as gradients, shadows, or intricate borders.
- Capture the unique styling characteristics of individual elements, ensuring they closely match the visual intricacies of the original UI design.
- Maintain consistent typography, including font styles, sizes, and weights.

Your goal is substantial improvement, with a particular emphasis on capturing the more complex styling aspects and the possible elements that were missed on the first iteration of the original mobile UI. While adhering to the guidelines provided in the first prompt, consider this iteration as an opportunity to refine and enhance not only accuracy but also the replication of intricate design details. Respond only with the generated HTML code and use entirely unique class names for the styles to prevent interference with the first iteration.`;

const JSON_PROMPT = `i will provide you a screenshot of mobile user interface. I want you to list all the visible user interface components and elements to a list of json objects, add each element as its own node, so that no object has child elements. Use the format: Label: [type], Text: [text], BoundingBox from (x1, y1) to (x2, y2), where the boundingBox includes the coordinates of the elements top-left corner as the first coordinate pair and bottom-right corner the second coordinate pair, replace the variables with the approximation of their position on the screen, it does not matter if you are unable to give the exact precise values.
Return only the list, no explanations, no additional information, nothing.`;

//Code refactoring needed
export default function Home() {
  const {
    file,
    loading,
    prompt,
    generatedOutput,
    modelOnlineStatus,
    temporaryImageFile,
    errorAlert,
    developerMode,
    maxTokens,
    temperature,
    useIterativePrompt,
    iterativePrompt,
    iterativeOutput,
    set,
    setGeneratedOutput,
    setIterativeOutput,
    modelName,
    apiKey,
    outputMode,
    jsonOutput,
    boundingBoxImageFile,
  } = useStore((state) => state);

  useEffect(() => {
    // Check if local LLM model is online
    const checkModel = async () => {
      if (modelName != "Local") return;
      try {
        const response = await fetch("http://localhost:1234/v1/models");
        if (response.ok) {
          set({ modelOnlineStatus: true });
        }
      } catch (error) {
        set({ modelOnlineStatus: false });
      }
    };
    checkModel();
  }, [modelOnlineStatus, set, modelName]);

  useEffect(() => {
    // trigger when jsonOutput changes
    console.log("Json output changed!");
    if (jsonOutput && temporaryImageFile) {
      console.log("Json output got updated!");
      generateBoundingBoxImage(temporaryImageFile, jsonOutput, set);
    }
  }, [jsonOutput]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      set({ errorAlert: false, file: event.target.files[0] });
      const reader = new FileReader();
      reader.onloadend = () => {
        set({ temporaryImageFile: reader.result as string });
      };
      try {
        reader.readAsDataURL(event.target.files[0]);
      } catch (error) {
        return;
      }
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    set({ errorAlert: false, loading: true, generatedOutput: null, iterativeOutput: null, jsonOutput: null });
    if (file) {
      await postImageAndPrompt(
        file,
        prompt ? prompt : outputMode === "JSON" ? JSON_PROMPT : DEFAULT_PROMPT,
        iterativePrompt ? iterativePrompt : DEFAULT_ITERATIVE_PROMPT,
        set,
        setGeneratedOutput,
        maxTokens,
        temperature,
        useIterativePrompt,
        setIterativeOutput,
        modelName,
        apiKey,
        jsonOutput,
        outputMode,
      );
    }
  };

  return (
    <main className="flex min-h-screen w-[100%] flex-col justify-start bg-gradient-to-tr from-cyan-50 to-violet-50 px-4 py-2 text-black">
      <div className="flex h-min w-[100%] flex-col items-center justify-center space-y-4">
        <div className="flex w-full flex-row justify-between px-4 py-2">
          <SettingsModal />
          <label className="inline-flex cursor-pointer items-center">
            <span className="me-3 text-sm font-medium text-gray-900">Developer mode</span>
            <input
              type="checkbox"
              checked={developerMode}
              onChange={() => set({ developerMode: !developerMode })}
              className="peer sr-only"
            />
            <div className="peer relative h-6 w-11 rounded-full bg-gray-200 after:absolute after:start-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-blue-600 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rtl:peer-checked:after:-translate-x-full dark:border-gray-600 dark:bg-gray-700 dark:peer-focus:ring-blue-800"></div>
          </label>
        </div>
        <div className="m-2 flex h-min w-[100%] min-w-[350px] flex-col space-y-2 rounded-md bg-white p-4 shadow-xl">
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
                <ModelRadioMenu />
                {!modelOnlineStatus && modelName == "Local" ? (
                  <h1 className="text-red-500">Local model is offline</h1>
                ) : null}
                <TokenSlider />
                <TemperatureSlider />
                <JSONRadioMenu />
                <label className="inline-flex w-max cursor-pointer items-center">
                  <span className="me-3 text-sm font-medium text-neutral-900">Use iterative prompting</span>
                  <input
                    type="checkbox"
                    checked={useIterativePrompt}
                    onChange={() => set({ useIterativePrompt: !useIterativePrompt })}
                    className="peer sr-only"
                    id="useIterativePrompting"
                  />
                  <div className="peer relative h-6 w-11 rounded-full bg-gray-200 after:absolute after:start-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-green-600 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rtl:peer-checked:after:-translate-x-full dark:border-gray-600 dark:bg-gray-700 dark:peer-focus:ring-blue-800"></div>
                </label>
                <div>
                  <span>Prompt:</span>
                  <textarea
                    value={prompt ? prompt : ""}
                    onChange={(e) => set({ prompt: e.target.value })}
                    rows={10}
                    placeholder={`${outputMode === "JSON" ? JSON_PROMPT : DEFAULT_PROMPT}`}
                    id="prompt"
                    className="w-[100%] rounded-md border border-neutral-300 bg-inherit p-2"
                  />
                  <div className="flex divide-x-2">
                    <InsertDefaultPromptButton
                      PROMPT={`${outputMode === "JSON" ? JSON_PROMPT : DEFAULT_PROMPT}`}
                      promptType={"first"}
                    />
                    <CopyButton
                      textToCopy={`${prompt ? prompt : outputMode === "JSON" ? JSON_PROMPT : DEFAULT_PROMPT}`}
                    />
                    <ClearPromptButton promptType={"first"} />
                  </div>
                </div>
                {useIterativePrompt && (
                  <div>
                    <span>Iterative prompt:</span>
                    <textarea
                      value={iterativePrompt ? iterativePrompt : ""}
                      onChange={(e) => set({ iterativePrompt: e.target.value })}
                      rows={10}
                      placeholder={`${DEFAULT_ITERATIVE_PROMPT}`}
                      id="prompt"
                      className="w-[100%] rounded-md border border-neutral-300 bg-inherit p-2"
                    />
                    <div className="flex divide-x-2">
                      <InsertDefaultPromptButton PROMPT={DEFAULT_ITERATIVE_PROMPT} promptType={"iterative"} />
                      <CopyButton textToCopy={iterativePrompt ? iterativePrompt : DEFAULT_ITERATIVE_PROMPT} />
                      <ClearPromptButton promptType={"iterative"} />
                    </div>
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
        <div className="m-2 flex h-min w-[100%] min-w-[350px] flex-col space-y-2 rounded-md bg-white p-4 shadow-xl">
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
        {outputMode === "JSON" && (
          <div className="flex w-full min-w-[350px] flex-col rounded-md bg-white p-4 shadow-xl">
            <p>Generated bounding box image:</p>
            {boundingBoxImageFile ? (
              <Image
                width={600}
                height={600}
                src={boundingBoxImageFile}
                className="mx-auto h-[60%] max-h-[400px] object-contain"
                alt="Bounding box image"
              />
            ) : null}
          </div>
        )}
        {outputMode === "HTML" && (
          <div className="flex w-full flex-wrap justify-center gap-2">
            <div
              className={`ml-0 flex ${useIterativePrompt ? "w-full md:w-[calc(50%-4px)]" : "w-full"} min-w-[350px] flex-col rounded-md bg-white p-4 shadow-xl`}
            >
              <p>Generated layout:</p>
              {generatedOutput && (
                <div
                  className="mx-auto mt-4 w-[400px] rounded-md border-2 border-gray-600"
                  dangerouslySetInnerHTML={{ __html: purify.sanitize(generatedOutput) }}
                />
              )}
            </div>
            {useIterativePrompt && (
              <div className="flex w-full min-w-[350px] flex-col rounded-md bg-white p-4 shadow-xl md:w-[calc(50%-4px)]">
                <p>Iterative layout:</p>
                {iterativeOutput && (
                  <div
                    className="mx-auto mt-4 w-[400px] rounded-md border-2 border-gray-600"
                    dangerouslySetInnerHTML={{ __html: purify.sanitize(iterativeOutput) }}
                  />
                )}
              </div>
            )}
          </div>
        )}
        {jsonOutput && (
          <CollapsibleContainer title="JSON output">
            <pre>
              <code id="codeblock" className="hljs JSON">
                {purify.sanitize(jsonOutput)}
              </code>
            </pre>
          </CollapsibleContainer>
        )}
        {generatedOutput && (
          <CollapsibleContainer title="Generated text output">
            <pre>
              <code id="codeblock" className={outputMode === "HTML" ? `hljs html` : `hljs JSON`}>
                {purify.sanitize(generatedOutput)}
              </code>
            </pre>
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
      <LoadingSpinner />
    </main>
  );
}
