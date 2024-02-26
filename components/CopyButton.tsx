import React, { useRef } from "react";

const CopyButton = ({ textToCopy }: { textToCopy: string }) => {
  const textAreaRef = useRef(null);

  const handleCopyClick = () => {
    try {
      navigator.clipboard.writeText(textToCopy);
      console.log("Content copied to clipboard");
    } catch (err) {
      console.error("Failed to copy: ", err);
    }
  };

  return (
    <div>
      <button type="button" className="mb-2 text-blue-600" onClick={handleCopyClick}>
        Copy Prompt
      </button>
    </div>
  );
};

export default CopyButton;
