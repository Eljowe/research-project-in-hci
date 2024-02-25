import { useStore } from "@/store/zustand";

export default function LoadingSpinner() {
  const loading = useStore((state) => state.loading);

  if (loading) {
    return (
      <div className="sticky bottom-5 left-[calc(100%-16px)] flex h-min w-min items-center justify-center rounded-full bg-black bg-opacity-5 p-2 backdrop-blur-sm">
        <div
          className="text-primary inline-block h-10 w-10 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] text-blue-600 motion-reduce:animate-[spin_1.5s_linear_infinite]"
          role="status"
        >
          <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">
            Loading...
          </span>
        </div>
      </div>
    );
  } else {
    return null;
  }
}
