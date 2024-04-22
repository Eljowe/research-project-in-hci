import { useStore } from "../app/store/zustand";

const TokenSlider = () => {
  const { maxTokens, set } = useStore((state) => state);

  return (
    <div className="flex w-full flex-col items-start justify-center gap-4 rounded-md border border-neutral-300 px-2 py-4">
      <label htmlFor="maxTokens" className="text-sm font-medium text-gray-900 ">
        Max Tokens
      </label>
      <input
        type="range"
        min="1"
        max="4096"
        step="1"
        value={maxTokens}
        onChange={(e) => set({ maxTokens: Number(e.target.value) })}
        className="w-full max-w-[400px]"
        id="maxTokens"
      />
      <div className="flex justify-between">
        <span>{maxTokens}</span>
      </div>
    </div>
  );
};
export default TokenSlider;
