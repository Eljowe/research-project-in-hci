// CollapsibleContainer.tsx
import hljs from "highlight.js";
import React, { useState, ReactNode, useRef, useEffect } from "react";
import "highlight.js/styles/vs2015.css";

interface CollapsibleContainerProps {
  title: string;
  children: ReactNode;
}

const CollapsibleContainer: React.FC<CollapsibleContainerProps> = ({ title, children }) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleContainer = () => {
    setIsOpen(!isOpen);
  };

  useEffect(() => {
    if (isOpen) {
      hljs.highlightAll();
    }
  }, [isOpen]);

  return (
    <div className="my-2 flex w-[100%] min-w-[350px] flex-col rounded-md bg-white p-4 shadow-xl">
      <div className="flex cursor-pointer items-center justify-between" onClick={toggleContainer}>
        <h2 className="text-xl font-semibold">{title}</h2>
        <svg
          className={`h-6 w-6 transform transition-transform ${isOpen ? "rotate-90" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
        </svg>
      </div>
      {isOpen && <div className="mt-4">{children}</div>}
    </div>
  );
};

export default CollapsibleContainer;
