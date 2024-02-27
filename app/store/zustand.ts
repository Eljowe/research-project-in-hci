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
};

export const useStore = create<State>((set) => ({
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
  set: (by) => set((state) => ({ ...state, ...by })),
  setIterativeOutput: (chunk) =>
    set((state) => ({
      iterativeOutput: state.iterativeOutput == null ? chunk : state.iterativeOutput + chunk,
    })),
  setGeneratedOutput: (chunk) =>
    set((state) => ({
      generatedOutput: state.generatedOutput == null ? chunk : state.generatedOutput + chunk,
    })),
}));
