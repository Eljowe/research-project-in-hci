import { useState } from "react";
import { useStore } from "../app/store/zustand";

export default function SettingsModal() {
  const [isOpen, setIsOpen] = useState(false);
  const { apiKey, set } = useStore((state) => state);
  return (
    <div>
      <button
        onClick={() => setIsOpen(true)}
        className="block rounded-lg bg-blue-700 px-5 py-2.5 text-center text-sm font-medium text-white hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 "
        type="button"
      >
        API keys
      </button>
      {isOpen && (
        <div
          id="default-modal"
          tabIndex={-1}
          aria-hidden="true"
          className="fixed left-0 right-0 top-0 z-50 h-[calc(100%-1rem)] max-h-full w-full items-center justify-center overflow-y-auto overflow-x-hidden md:inset-0"
        >
          <div className="relative max-h-full w-full max-w-2xl p-4">
            <div className="relative rounded-lg bg-white shadow">
              <div className="flex flex-col items-center justify-between space-y-2 rounded-t p-4 md:p-5 ">
                <div className="flex w-full flex-row justify-between">
                  <h3 className="text-xl font-semibold text-black">Settings</h3>
                  <button
                    type="button"
                    className="ms-auto inline-flex h-8 w-8 items-center justify-center rounded-lg bg-transparent text-sm text-gray-400 hover:bg-gray-200 hover:text-gray-900 "
                    onClick={() => setIsOpen(false)}
                  >
                    <svg
                      className="h-6 w-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <div>
                  <span>OpenAI API Key: </span>
                  <input
                    type="text"
                    value={apiKey ? apiKey : ""}
                    className="rounded-md border border-neutral-300 bg-inherit px-2"
                    onChange={(e) => set({ apiKey: e.target.value })}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
