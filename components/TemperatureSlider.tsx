import { useStore } from "../store/zustand";

const TemperatureSlider = () => {
  const { temperature, set } = useStore((state) => state);

  return (
    <div className="flex w-full flex-col items-start justify-center gap-4 rounded-md border border-neutral-300 px-2 py-4">
      <label htmlFor="temperature" className="text-sm font-medium text-gray-900 ">
        Temperature
      </label>
      <input
        type="range"
        min="0.001"
        max="1"
        step="0.001"
        value={temperature}
        onChange={(e) => set({ temperature: Number(e.target.value) })}
        className="w-full max-w-[400px]"
      />
      <div className="flex justify-between">
        <span>{temperature}</span>
      </div>
    </div>
  );
};

export default TemperatureSlider;
