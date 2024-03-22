import { create } from "zustand";
import { persist } from "zustand/middleware";

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
  set: (by: Partial<State>) => void;
  setIterativeOutput: (chunk: string) => void;
  setGeneratedOutput: (chunk: string) => void;
  modelName: string;
  apiKey: string | null;
  outputMode: string;
  jsonOutput: string | null;
};

export const useStore = create<State>()(
  persist(
    (set) => ({
      file: null,
      loading: false,
      prompt: null,
      generatedOutput: null,
      modelOnlineStatus: false,
      temporaryImageFile: null,
      errorAlert: false,
      developerMode: false,
      maxTokens: 2000,
      temperature: 0.001,
      useIterativePrompt: false,
      iterativePrompt: null,
      iterativeOutput: null,
      modelName: "GPT",
      apiKey: null,
      outputMode: "JSON",
      jsonOutput: null,
      set: (by) => set((state) => ({ ...state, ...by })),
      setIterativeOutput: (chunk) =>
        set((state) => ({
          iterativeOutput: state.iterativeOutput == null ? chunk : state.iterativeOutput + chunk,
        })),
      setGeneratedOutput: (chunk) =>
        set((state) => ({
          generatedOutput: state.generatedOutput == null ? chunk : state.generatedOutput + chunk,
        })),
    }),
    {
      // These are the keys that will be stored in localStorage
      name: "zustand",
      partialize: (state: State) => ({
        developerMode: state.developerMode,
        maxTokens: state.maxTokens,
        modelName: state.modelName,
        temperature: state.temperature,
        useIterativePrompt: state.useIterativePrompt,
        prompt: state.prompt,
        iterativePrompt: state.iterativePrompt,
        apiKey: state.apiKey,
        outputMode: state.outputMode,
      }),
    },
  ),
);
