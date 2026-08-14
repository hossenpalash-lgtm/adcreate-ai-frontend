function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const words = text.split(" ");
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    const test = current ? `${current} ${word}` : word;
    if (current && ctx.measureText(test).width > maxWidth) {
      lines.push(current);
      current = word;
    } else {
      current = test;
    }
  }
  if (current) lines.push(current);
  return lines;
}

// Bakes the AI-generated caption onto the banner as real text — image
// models render text poorly/unreliably, so the model only edits the
// background and this step adds the actual words. Shared by both the
// single-post form and the weekly-plan form's per-day generation.
export async function compositeImage(base64: string, caption: string): Promise<string> {
  const img = new Image();
  img.src = `data:image/png;base64,${base64}`;
  await new Promise<void>((resolve, reject) => {
    img.onload = () => resolve();
    img.onerror = () => reject(new Error("Could not load the image."));
  });

  const canvas = document.createElement("canvas");
  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not create the image.");
  ctx.drawImage(img, 0, 0);

  const fontSize = Math.round(canvas.width * 0.055);
  const fontStack = `700 ${fontSize}px "Inter", "Plus Jakarta Sans", sans-serif`;
  ctx.font = fontStack;
  const maxTextWidth = canvas.width * 0.88;
  const lines = wrapText(ctx, caption, maxTextWidth).slice(0, 5);
  const lineHeight = fontSize * 1.35;
  const padding = fontSize * 0.8;
  const barHeight = lines.length * lineHeight + padding * 2;

  const gradient = ctx.createLinearGradient(0, canvas.height - barHeight, 0, canvas.height);
  gradient.addColorStop(0, "rgba(0,0,0,0)");
  gradient.addColorStop(0.35, "rgba(0,0,0,0.72)");
  gradient.addColorStop(1, "rgba(0,0,0,0.85)");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, canvas.height - barHeight, canvas.width, barHeight);

  ctx.font = fontStack;
  ctx.fillStyle = "#ffffff";
  ctx.textBaseline = "top";
  let y = canvas.height - barHeight + padding;
  for (const line of lines) {
    const lineWidth = ctx.measureText(line).width;
    ctx.fillText(line, (canvas.width - lineWidth) / 2, y);
    y += lineHeight;
  }

  return canvas.toDataURL("image/jpeg", 0.92);
}
