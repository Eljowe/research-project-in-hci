export default function Home() {
  return (
    <main className="w-[100%] border justify-center flex-wrap border-red-600 flex min-h-screen text-black bg-[#fffafa] p-6">
      <div className="min-w-[400px] m-2 max-h-[400px] flex max-w-screen border p-4">
        <p>Input form</p>
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
