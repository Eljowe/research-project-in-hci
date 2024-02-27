import { useStore } from "../app/store/zustand";

const ClearPromptButton = ({ promptType }: { promptType: string }) => {
  const { prompt, set } = useStore((state) => state);

  const clearPrompt = () => {
    if (promptType === "iterative") {
      set({ iterativePrompt: null });
    } else set({ prompt: null });
  };

  return (
    <button type="button" className="mb-2 pl-2 text-blue-600" onClick={clearPrompt}>
      Clear Prompt
    </button>
  );
};

export default ClearPromptButton;
