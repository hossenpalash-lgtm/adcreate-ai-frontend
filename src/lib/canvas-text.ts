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

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const clean = hex.replace("#", "");
  return {
    r: parseInt(clean.slice(0, 2), 16),
    g: parseInt(clean.slice(2, 4), 16),
    b: parseInt(clean.slice(4, 6), 16),
  };
}

// Perceptual luminance — decides whether text on top of the brand-color
// bar should be white or near-black, since a user-picked brand color
// could be dark (needs white text, like the default black bar) or light
// (needs dark text, or white-on-light would be unreadable).
function isLight({ r, g, b }: { r: number; g: number; b: number }): boolean {
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255 > 0.6;
}

export interface BrandKit {
  color?: string | null;
  logoDataUrl?: string | null;
}

function loadImage(src: string): Promise<HTMLImageElement> {
  const img = new Image();
  img.src = src;
  return new Promise((resolve, reject) => {
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Could not load the image."));
  });
}

// Bakes the AI-generated caption onto the banner as real text — image
// models render text poorly/unreliably, so the model only edits the
// background and this step adds the actual words. Shared by both the
// single-post form and the weekly-plan form's per-day generation.
export async function compositeImage(base64: string, caption: string, brandKit?: BrandKit): Promise<string> {
  const img = await loadImage(`data:image/png;base64,${base64}`);

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

  const barRgb = brandKit?.color ? hexToRgb(brandKit.color) : { r: 0, g: 0, b: 0 };
  const textColor = brandKit?.color && isLight(barRgb) ? "#1a1a1a" : "#ffffff";

  const gradient = ctx.createLinearGradient(0, canvas.height - barHeight, 0, canvas.height);
  gradient.addColorStop(0, `rgba(${barRgb.r},${barRgb.g},${barRgb.b},0)`);
  gradient.addColorStop(0.35, `rgba(${barRgb.r},${barRgb.g},${barRgb.b},0.8)`);
  gradient.addColorStop(1, `rgba(${barRgb.r},${barRgb.g},${barRgb.b},0.92)`);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, canvas.height - barHeight, canvas.width, barHeight);

  ctx.font = fontStack;
  ctx.fillStyle = textColor;
  ctx.textBaseline = "top";
  let y = canvas.height - barHeight + padding;
  for (const line of lines) {
    const lineWidth = ctx.measureText(line).width;
    ctx.fillText(line, (canvas.width - lineWidth) / 2, y);
    y += lineHeight;
  }

  if (brandKit?.logoDataUrl) {
    try {
      const logo = await loadImage(brandKit.logoDataUrl);
      const logoW = canvas.width * 0.16;
      const logoH = logoW * (logo.naturalHeight / logo.naturalWidth);
      const pad = canvas.width * 0.03;
      const plateW = logoW + pad;
      const plateH = logoH + pad;
      ctx.fillStyle = "rgba(255,255,255,0.92)";
      ctx.beginPath();
      ctx.roundRect(pad, pad, plateW, plateH, 10);
      ctx.fill();
      ctx.drawImage(logo, pad + pad / 2, pad + pad / 2, logoW, logoH);
    } catch {
      // Logo failed to load (corrupt data, etc.) — the post is still
      // useful without it, so this isn't worth failing the whole thing.
    }
  }

  return canvas.toDataURL("image/jpeg", 0.92);
}
