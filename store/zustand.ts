import { create } from "zustand";

type State = {
  file: File | null;
  loading: boolean;
  prompt: string | null;
  generatedOutput: string | null;
  modelOnlineStatus: boolean;
  temporaryImageFile: string | null;
  errorAlert: boolean;
  developerMode: boolean;
  useLocalModel: boolean;
  maxTokens: number | null;
  temperature: number | null;
  useIterativePrompt: boolean;
  iterativePrompt: string | null;
  iterativeOutput: string | null;
  set: (by: Partial<State>) => void;
  setIterativeOutput: (chunk: string) => void;
  setGeneratedOutput: (chunk: string) => void;
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
  useLocalModel: false,
  maxTokens: null,
  temperature: null,
  useIterativePrompt: false,
  iterativePrompt: null,
  iterativeOutput: null,
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
