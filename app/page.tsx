"use client";
import { useEffect } from "react";
import Image from "next/image";
import purify from "dompurify";
import CollapsibleContainer from "../components/CollapsibleContainer";
import { useStore } from "../store/zustand";
import { postImageAndPrompt } from "../services/promptService";
import LoadingSpinner from "@/components/LoadingSpinner";
import RadioMenu from "@/components/RadioMenu";
import TemperatureSlider from "@/components/TemperatureSlider";
import TokenSlider from "@/components/TokenSlider";

const DEFAULT_PROMPT = `Identify and meticulously analyze every visible user interface element in the provided mobile UI screenshot. Include buttons, text fields, images, labels, and other components. Generate a precise HTML layout with styling, placing significant emphasis on accuracy. Strictly focus on structural elements and styling attributes.

- Maintain the original aspect ratio and set the correct width and height in pixels for each element.
- If a search icon is detected, represent it with a same-size grey container labeled "Search Icon" (without src attributes), ensuring it's not misinterpreted as a search bar. Replace other images, logos, and icons with similar grey containers.
- Exclude any unnecessary accompanying text, comments, or additional HTML. The output should contain only the HTML structure and styling.
- No stretching or distortion is allowed. Estimate the device width and height realistically and use them as constraining constants.
- Wrap the UI in a div to emulate the original aspect ratio. Do not use 'position: absolute' or 'position: fixed' for any elements.
- Preserve the original language of any text content without translation.
- Use custom class names for the HTML elements to prevent interference with future iterations. Append "first-iteration-" as a prefix to each class name.

Your primary focus is on delivering an HTML layout that accurately represents the structure of the original mobile UI screenshot. Respond only with the generated HTML code.
`;
const DEFAULT_ITERATIVE_PROMPT = `In this second iteration, your primary goal remains the substantial improvement of the HTML layout generated in the first attempt. Learn from any inaccuracies or deviations observed in the initial output and focus on rectifying these issues. Carefully validate and adjust the size, placement, and arrangement of each user interface element to more closely match the original mobile UI screenshot.

- Correct any discrepancies in the positioning and sizing of UI components. Pay particular attention to elements that were inaccurately represented in the first attempt.
- Ensure buttons, labels, and other components maintain their intended arrangement. Strive to capture the precise structure observed in the original screenshot.
- Maintain the original aspect ratio without introducing stretching or distortion. Rectify any deviations from the accurate aspect ratio in the first iteration.
- Represent logos, labels, and images with same-size grey containers. Refine size estimates for improved precision.
- Avoid the use of 'position: absolute' for any UI element. Elements should flow naturally within the layout.

### Additional Guidance for Complex Styling Replication:

- Try to replicate more complex styling aspects observed in the original screenshot. Pay attention to nuanced details such as gradients, shadows, or intricate borders.
- Capture the unique styling characteristics of individual elements, ensuring they closely match the visual intricacies of the original UI design.
- Maintain consistent typography, including font styles, sizes, and weights.

Your goal is substantial improvement, with a particular emphasis on capturing the more complex styling aspects and the possible elements that were missed on the first iteration of the original mobile UI. While adhering to the guidelines provided in the first prompt, consider this iteration as an opportunity to refine and enhance not only accuracy but also the replication of intricate design details. Respond only with the generated HTML code and use entirely unique class names for the styles to prevent interference with the first iteration.`;

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
    set({ errorAlert: false, loading: true, generatedOutput: null, iterativeOutput: null });
    if (file) {
      await postImageAndPrompt(
        file,
        prompt ? prompt : DEFAULT_PROMPT,
        iterativePrompt ? iterativePrompt : DEFAULT_ITERATIVE_PROMPT,
        set,
        setGeneratedOutput,
        maxTokens,
        temperature,
        useIterativePrompt,
        setIterativeOutput,
        modelName,
      );
    }
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
              onChange={() => set({ developerMode: !developerMode })}
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
                <RadioMenu />
                {!modelOnlineStatus && modelName == "Local" ? (
                  <h1 className="text-red-500">Local model is offline</h1>
                ) : null}
                <TokenSlider />
                <TemperatureSlider />
                <label className="inline-flex w-max cursor-pointer items-center">
                  <span className="me-3 text-sm font-medium text-neutral-900">Use iterative prompting</span>
                  <input
                    type="checkbox"
                    checked={useIterativePrompt}
                    onChange={() => set({ useIterativePrompt: !useIterativePrompt })}
                    className="peer sr-only"
                    id="useLocalModel"
                  />
                  <div className="peer relative h-6 w-11 rounded-full bg-gray-200 after:absolute after:start-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-green-600 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rtl:peer-checked:after:-translate-x-full dark:border-gray-600 dark:bg-gray-700 dark:peer-focus:ring-blue-800"></div>
                </label>
                <div>
                  <span>Prompt:</span>
                  <textarea
                    onChange={(e) => set({ prompt: e.target.value })}
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
                      onChange={(e) => set({ iterativePrompt: e.target.value })}
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
      <LoadingSpinner />
    </main>
  );
}
