// Free, client-side-only resizing of the already-generated (and already
// composited-with-text) square banner into common ad placements — no AI
// call, no credit cost, since it's just pixels being rearranged.

async function loadImage(dataUrl: string): Promise<HTMLImageElement> {
  const img = new Image();
  img.src = dataUrl;
  await new Promise<void>((resolve, reject) => {
    img.onload = () => resolve();
    img.onerror = () => reject(new Error("Could not load the image."));
  });
  return img;
}

// The source is always square (1:1) — every target ratio here is taller
// than square, so there's nothing to crop, only extra height to fill.
// Filled with a blurred, oversized copy of the same image behind the
// original at native size, rather than a plain color bar, so it still
// looks like one intentional image instead of a pasted sticker.
function renderTaller(img: HTMLImageElement, aspectW: number, aspectH: number): string {
  const srcW = img.naturalWidth;
  const srcH = img.naturalHeight;
  const targetW = srcW;
  const targetH = Math.round(srcW * (aspectH / aspectW));

  const canvas = document.createElement("canvas");
  canvas.width = targetW;
  canvas.height = targetH;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not create the image.");

  ctx.filter = "blur(28px)";
  const scale = Math.max(targetW / srcW, targetH / srcH) * 1.15;
  const bw = srcW * scale;
  const bh = srcH * scale;
  ctx.drawImage(img, (targetW - bw) / 2, (targetH - bh) / 2, bw, bh);
  ctx.filter = "none";

  ctx.fillStyle = "rgba(0,0,0,0.18)";
  ctx.fillRect(0, 0, targetW, targetH);

  const offsetY = Math.round((targetH - srcH) / 2);
  ctx.drawImage(img, 0, offsetY, srcW, srcH);

  return canvas.toDataURL("image/jpeg", 0.92);
}

export interface AdSizeExports {
  square: string;
  feed: string;
  story: string;
}

export async function exportAdSizes(compositedDataUrl: string): Promise<AdSizeExports> {
  const img = await loadImage(compositedDataUrl);
  return {
    square: compositedDataUrl,
    feed: renderTaller(img, 4, 5),
    story: renderTaller(img, 9, 16),
  };
}
