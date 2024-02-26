import { useStore } from "../store/zustand";

const RadioMenu = () => {
  const { modelName, set } = useStore((state) => state);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    set({ modelName: event.target.value });
  };

  return (
    <div className="grid w-full grid-cols-4 gap-2 rounded-xl bg-gray-200 p-2">
      <div className="mb-4 flex items-center">
        <input
          id="default-radio-1"
          type="radio"
          value="GPT"
          checked={modelName === "GPT"}
          name="default-radio"
          onChange={handleChange}
          className="h-4 w-4 border-gray-300 bg-gray-100 text-blue-600 focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:ring-offset-gray-800 dark:focus:ring-blue-600"
        />
        <label htmlFor="default-radio-1" className="ms-2 text-sm font-medium text-gray-900 dark:text-gray-300">
          GPT-4-Vision
        </label>
      </div>
      <div className="mb-4 flex items-center">
        <input
          id="default-radio-1"
          type="radio"
          value="Local"
          checked={modelName === "Local"}
          name="default-radio"
          onChange={handleChange}
          className="h-4 w-4 border-gray-300 bg-gray-100 text-blue-600 focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:ring-offset-gray-800 dark:focus:ring-blue-600"
        />
        <label htmlFor="default-radio-1" className="ms-2 text-sm font-medium text-gray-900 dark:text-gray-300">
          Local
        </label>
      </div>
      <div className="flex items-center">
        <input
          checked={modelName === "Gemini"}
          id="default-radio-2"
          type="radio"
          value="Gemini"
          name="default-radio"
          onChange={handleChange}
          className="h-4 w-4 border-gray-300 bg-gray-100 text-blue-600 focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:ring-offset-gray-800 dark:focus:ring-blue-600"
        />
        <label htmlFor="default-radio-2" className="ms-2 text-sm font-medium text-gray-900 dark:text-gray-300">
          Gemini
        </label>
      </div>
      <span>selected: {modelName}</span>
    </div>
  );
};

export default RadioMenu;
