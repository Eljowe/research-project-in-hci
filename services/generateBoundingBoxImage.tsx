import { State } from "../app/store/zustand";

export async function generateBoundingBoxImage(
  imageFile: string,
  jsonOutput: string,
  set: (by: Partial<State>) => void,
) {
  console.log("Generating bounding box image...");

  // Parse the JSON output to get the bounding box coordinates
  const boundingBoxes = JSON.parse(jsonOutput).map((item: any) => {
    const regex = /\((\d+), (\d+)\) to \((\d+), (\d+)\)/;
    const match = item.BoundingBox.match(regex);
    const [, x1, y1, x2, y2] = match.map(Number);
    return { x1, y1, x2, y2, label: item.Label };
  });

  // Create an image element
  const image = new Image();
  image.crossOrigin = "Anonymous"; // Use this for CORS if needed
  image.onload = () => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    canvas.width = image.width;
    canvas.height = image.height;

    // Draw the original image
    if (ctx) {
      ctx.drawImage(image, 0, 0);
    }

    // Draw each bounding box
    boundingBoxes.forEach(
      ({ x1, y1, x2, y2, label }: { x1: number; y1: number; x2: number; y2: number; label: string }) => {
        if (!ctx) return;
        ctx.beginPath();
        ctx.rect(x1, y1, x2 - x1, y2 - y1);
        ctx.strokeStyle = "red";
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.closePath();

        // Optionally, add the label above the rectangle
        ctx.font = "16px Arial";
        ctx.fillStyle = "red";
        ctx.fillText(label, x1, y1 - 10);
      },
    );

    // Convert the canvas to a data URL
    const imageDataUrl = canvas.toDataURL();

    // Set the bounding box image data URL in the store
    set({ boundingBoxImageFile: imageDataUrl });
  };

  // Trigger image loading
  image.src = imageFile;
}
