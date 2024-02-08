"use client";
import { FormEvent } from "react";
import { useState } from "react";

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setFile(event.target.files[0]);
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    console.log("Submitting");
    if (file) {
      const data = await uploadImage(file);
    }
    console.log("Submitted");
    setLoading(false);
  };

  async function uploadImage(file: File) {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch("/api/imageupload", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error("Image upload failed");
    }

    const data = await response.json();
    return data;
  }

  return (
    <main className="w-[100%] border justify-center flex-wrap border-red-600 flex min-h-screen text-black bg-[#fffafa] p-6">
      <div className="min-w-[400px] m-2 max-h-[400px] flex max-w-screen border p-4">
        <div className="mb-3">
          <form onSubmit={handleSubmit}>
            <label className="mb-2 inline-block text-neutral-900 ">Default file input example</label>
            <input
              className="relative m-0 block w-full min-w-0 flex-auto rounded border border-solid border-neutral-300 bg-clip-padding px-3 py-[0.32rem] text-base font-normal transition duration-300 ease-in-out file:-mx-3 file:-my-[0.32rem] file:overflow-hidden file:rounded-none file:border-0 file:border-solid file:border-inherit file:bg-neutral-100 file:px-3 file:py-[0.32rem] file file:transition file:duration-150 file:ease-in-out file:[border-inline-end-width:1px] file:[margin-inline-end:0.75rem] hover:file:bg-neutral-300 cursor-pointer focus:border-primary focus focus:shadow-te-primary focus:outline-none "
              type="file"
              id="formFile"
              accept="image/jpeg, image/png, image/jpg"
              onChange={handleFileChange}
            />
            <input
              type="submit"
              value="Submit"
              {...(loading && { disabled: true })}
              className={`${loading ? "cursor-wait" : "cursor-pointer hover:bg-neutral-300"} mt-2 rounded p-2 border`}
            />
          </form>
        </div>
      </div>
      <div className="min-w-[400px] max-h-[400px] m-2 flex max-w-screen border p-4">
        <p>Input image</p>
      </div>
      <div className="min-w-[400px] max-h-[400px] m-2 flex max-w-screen border p-4">
        <p>Generated output</p>
      </div>
    </main>
  );
}
