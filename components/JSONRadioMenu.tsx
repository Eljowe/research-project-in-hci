import { useStore } from "../app/store/zustand";

const JSONRadioMenu = () => {
  const { outputMode, set } = useStore((state) => state);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    set({ outputMode: event.target.value });
  };

  return (
    <div className="flex w-full flex-col items-start justify-center gap-4 rounded-md border border-neutral-300 px-2 py-4">
      <div className="flex items-center">
        <input
          id="json-radio-1"
          type="radio"
          value="JSON"
          checked={outputMode === "JSON"}
          name="json-radio"
          onChange={handleChange}
          className="h-4 w-4 border-gray-300 bg-gray-100 text-blue-600 focus:ring-2 focus:ring-blue-500  dark:focus:ring-blue-600"
        />
        <label htmlFor="json-radio-1" className="ms-2 text-sm font-medium text-gray-900 ">
          JSON output
        </label>
      </div>
      <div className="flex items-center">
        <input
          id="json-radio-2"
          type="radio"
          value="HTML"
          checked={outputMode === "HTML"}
          name="json-radio"
          onChange={handleChange}
          className="h-4 w-4 border-gray-300 bg-gray-100 text-blue-600 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600"
        />
        <label htmlFor="json-radio-2" className="ms-2 text-sm font-medium text-gray-900">
          HTML output
        </label>
      </div>
    </div>
  );
};

export default JSONRadioMenu;
