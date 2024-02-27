import { useStore } from "../app/store/zustand";
const InsertDefaultPromptButton = ({ PROMPT, promptType }: { PROMPT: string; promptType: string }) => {
  const { set } = useStore((state) => state);

  const insertDefaultPrompt = () => {
    if (promptType === "iterative") {
      set({ iterativePrompt: PROMPT });
    } else set({ prompt: PROMPT });
  };

  return (
    <button type="button" className="mb-2 pr-2 text-blue-600" onClick={insertDefaultPrompt}>
      Insert Default Prompt
    </button>
  );
};

export default InsertDefaultPromptButton;
