import { useState, useEffect, useRef } from "react";
import { useStore } from "../app/store/zustand";
import { IoSettingsOutline } from "react-icons/io5";

export default function SettingsModal() {
  const [isOpen, setIsOpen] = useState(false);
  const { apiKey, set } = useStore((state) => state);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: any) {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [modalRef]);

  return (
    <div>
      <button
        onClick={() => setIsOpen(true)}
        className="block rounded-lg text-center text-2xl font-medium text-black focus:outline-none focus:ring-4 focus:ring-blue-300"
        type="button"
      >
        <IoSettingsOutline />
      </button>
      {isOpen && (
        <div
          id="default-modal"
          tabIndex={-1}
          aria-hidden="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
        >
          <div ref={modalRef} className="relative w-full max-w-2xl p-4">
            <div className="relative rounded-lg bg-white shadow">
              <div className="flex min-h-[200px] flex-col items-center justify-start space-y-2 rounded-t p-4 md:p-5">
                <div className="flex w-full flex-row justify-start">
                  <h3 className="text-xl font-semibold text-black">Settings</h3>
                  <button
                    type="button"
                    className="ms-auto inline-flex h-8 w-8 items-center justify-center rounded-lg bg-transparent text-sm text-gray-400 hover:bg-gray-200 hover:text-gray-900"
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
                <div className="flex w-full grow items-center justify-center">
                  <div className="w-72">
                    <div className="relative h-10 w-full min-w-[200px]">
                      <input
                        type="text"
                        value={apiKey ? apiKey : ""}
                        placeholder=" "
                        className="text-blue-gray-700 disabled:bg-blue-gray-50 placeholder-shown:border-blue-gray-200 placeholder-shown:border-t-blue-gray-200 border-blue-gray-200 peer h-full w-full rounded-[7px] border border-t-transparent bg-transparent px-3 py-2.5 font-sans text-sm font-normal outline outline-0 transition-all placeholder-shown:border focus:border-2 focus:border-gray-900 focus:border-t-transparent focus:outline-0 disabled:border-0"
                        onChange={(e) => set({ apiKey: e.target.value })}
                      />
                      <label className="peer-placeholder-shown:text-blue-gray-500 peer-disabled:peer-placeholder-shown:text-blue-gray-500 before:content[' '] after:content[' '] before:border-blue-gray-200 after:border-blue-gray-200 pointer-events-none absolute -top-1.5 left-0 flex h-full w-full select-none !overflow-visible truncate text-[11px] font-normal leading-tight text-gray-500 transition-all before:pointer-events-none before:mr-1 before:mt-[6.5px] before:box-border before:block before:h-1.5 before:w-2.5 before:rounded-tl-md before:border-l before:border-t before:transition-all after:pointer-events-none after:ml-1 after:mt-[6.5px] after:box-border after:block after:h-1.5 after:w-2.5 after:flex-grow after:rounded-tr-md after:border-r after:border-t after:transition-all peer-placeholder-shown:text-sm peer-placeholder-shown:leading-[3.75] peer-placeholder-shown:before:border-transparent peer-placeholder-shown:after:border-transparent peer-focus:text-[11px] peer-focus:leading-tight peer-focus:text-gray-900 peer-focus:before:border-l-2 peer-focus:before:border-t-2 peer-focus:before:!border-gray-900 peer-focus:after:border-r-2 peer-focus:after:border-t-2 peer-focus:after:!border-gray-900 peer-disabled:text-transparent peer-disabled:before:border-transparent peer-disabled:after:border-transparent">
                        API key
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
