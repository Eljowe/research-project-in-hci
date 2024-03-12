import hljs from "highlight.js";
import "highlight.js/styles/vs2015.css";

type State = {
  file: File | null;
  loading: boolean;
  prompt: string | null;
  generatedOutput: string | null;
  modelOnlineStatus: boolean;
  temporaryImageFile: string | null;
  errorAlert: boolean;
  developerMode: boolean;
  maxTokens: number;
  temperature: number;
  useIterativePrompt: boolean;
  iterativePrompt: string | null;
  iterativeOutput: string | null;
  apiKey: string | null;
  set: (by: Partial<State>) => void;
  setIterativeOutput: (chunk: string) => void;
  setGeneratedOutput: (chunk: string) => void;
};

export async function postImageAndPrompt(
  file: File,
  prompt: string,
  iterative_prompt: string,
  set: (by: Partial<State>) => void,
  setGeneratedOutput: (chunk: string) => void,
  maxTokens: number,
  temperature: number,
  useIterativePrompt: boolean,
  setIterativeOutput: (chunk: string) => void,
  modelName: string,
  apiKey: string | null,
) {
  const formData = new FormData();
  try {
    formData.append("file", file);
    formData.append("prompt", prompt);
    formData.append("maxTokens", maxTokens != null && maxTokens > 0 ? maxTokens.toString() : "2000");
    formData.append("temperature", temperature != null ? temperature.toString() : "0.001");
    formData.append("apiKey", apiKey != null ? apiKey : "null");
    var response = null;
    if (modelName === "Gemini") {
      response = await fetch("/api/vertex", {
        method: "POST",
        body: formData,
      });
    }
    if (modelName === "GPT") {
      console.log("Using GPT model");
      response = await fetch("/api/openai", {
        method: "POST",
        body: formData,
      });
    }
    if (modelName === "Local") {
      response = await fetch("/api/localModel", {
        method: "POST",
        body: formData,
      });
    }
    if (!response!.ok) {
      set({ errorAlert: true, loading: false });
      return;
    } else {
      const reader = response!.body!.getReader();
      const processStream = async () => {
        let fullOutput = "";
        while (true) {
          const { done, value } = await reader.read();
          if (done) {
            console.log("stream completed");
            set({ loading: false });
            hljs.highlightAll();
            if (useIterativePrompt) {
              await postIterativePrompt(
                prompt,
                formData,
                fullOutput,
                iterative_prompt,
                set,
                setIterativeOutput,
                modelName,
                apiKey,
              );
            }
            return done;
          }
          let chunk = new TextDecoder("utf-8").decode(value);
          chunk = chunk.replace(/^data: /, "");
          fullOutput += chunk;
          setGeneratedOutput(chunk);
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

async function postIterativePrompt(
  prompt: string,
  formData: FormData,
  fullOutput: string,
  iterative_prompt: string,
  set: (by: Partial<State>) => void,
  setIterativeOutput: (chunk: string) => void,
  modelName: string,
  apiKey: string | null,
) {
  try {
    set({ loading: true });
    if (fullOutput == null) {
      console.error("No previous output to use for iterative prompt");
      set({ loading: false });
      return;
    }
    formData.set(
      "prompt",
      iterative_prompt + " Here is the previous prompt: " + prompt + " Here is the previous output: " + fullOutput,
    );
    var response = null;
    if (modelName === "Gemini") {
      response = await fetch("/api/vertex", {
        method: "POST",
        body: formData,
      });
    }
    if (modelName === "GPT") {
      response = await fetch("/api/openai", {
        method: "POST",
        body: formData,
      });
    }
    if (modelName === "Local") {
      response = await fetch("/api/localModel", {
        method: "POST",
        body: formData,
      });
    }
    if (!response!.ok) {
      set({ errorAlert: true, loading: false });
      return;
    } else {
      const reader = response!.body!.getReader();
      const processStream = async () => {
        while (true) {
          const { done, value } = await reader.read();
          if (done) {
            console.log("Iterative stream completed");
            set({ loading: false });
            hljs.highlightAll();
            return done;
          }
          let chunk = new TextDecoder("utf-8").decode(value);
          chunk = chunk.replace(/^data: /, "");
          setIterativeOutput(chunk);
        }
      };
      processStream().catch((err) => {
        console.log("--Iterative stream error--", err);
        return null;
      });
    }
  } catch (error) {
    set({ loading: false });
    console.error("Error occured while iterative process: ", error);
    return null;
  }
}
