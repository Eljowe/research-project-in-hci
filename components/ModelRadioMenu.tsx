import { useStore } from "../app/store/zustand";

const ModelRadioMenu = () => {
  const { modelName, set } = useStore((state) => state);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    set({ modelName: event.target.value });
  };

  return (
    <div className="flex w-full flex-col items-start justify-center gap-4 rounded-md border border-neutral-300 px-2 py-4">
      <div className="flex items-center">
        <input
          id="default-radio-1"
          type="radio"
          value="GPT"
          checked={modelName === "GPT"}
          name="default-radio"
          onChange={handleChange}
          className="h-4 w-4 border-gray-300 bg-gray-100 text-blue-600 focus:ring-2 focus:ring-blue-500  dark:focus:ring-blue-600"
        />
        <label htmlFor="default-radio-1" className="ms-2 text-sm font-medium text-gray-900 ">
          GPT-4-Vision
        </label>
      </div>
      <div className="flex items-center">
        <input
          id="default-radio-2"
          type="radio"
          value="Local"
          checked={modelName === "Local"}
          name="default-radio"
          onChange={handleChange}
          className="h-4 w-4 border-gray-300 bg-gray-100 text-blue-600 focus:ring-2 focus:ring-blue-500  dark:focus:ring-blue-600"
        />
        <label htmlFor="default-radio-2" className="ms-2 text-sm font-medium text-gray-900 ">
          Local
        </label>
      </div>
      <div className="flex items-center">
        <input
          checked={modelName === "Gemini"}
          id="default-radio-3"
          type="radio"
          value="Gemini"
          name="default-radio"
          onChange={handleChange}
          className="h-4 w-4 border-gray-300 bg-gray-100 text-blue-600 focus:ring-2 focus:ring-blue-500  dark:focus:ring-blue-600"
        />
        <label htmlFor="default-radio-3" className="ms-2 text-sm font-medium text-gray-900 ">
          Gemini
        </label>
      </div>
    </div>
  );
};

export default ModelRadioMenu;
