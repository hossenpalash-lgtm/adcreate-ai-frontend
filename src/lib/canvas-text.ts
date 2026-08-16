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

// A freeform placement, all fields 0-1 relative to the canvas's own
// width/height so it's resolution-independent — same box works whether
// the source image is square, 4:5, or 9:16.
export interface Box {
  x: number; // left edge
  y: number; // top edge
  width: number;
}

// Per-post overrides on top of the Brand Kit defaults — the "quick edit"
// panel. barColorOverride is tri-state: undefined = use brandKit.color,
// null = force the default black bar for this post, a hex string = use
// that color just for this post. textBox/logoBox are unset until the
// user actually drags something in the drag-and-drop editor — until
// then, rendering falls back to the original edge-anchored gradient bar
// and fixed top-left logo badge, unchanged from before this existed.
export interface EditOptions {
  fontScale?: number; // 1 = default; ~0.8 small, ~1.25 large
  barPosition?: "top" | "bottom"; // default "bottom" — ignored once textBox is set
  barColorOverride?: string | null;
  showLogo?: boolean; // default true
  textBox?: Box;
  logoBox?: Box;
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
export async function compositeImage(
  base64: string,
  caption: string,
  brandKit?: BrandKit,
  editOptions?: EditOptions,
): Promise<string> {
  const img = await loadImage(`data:image/png;base64,${base64}`);

  const canvas = document.createElement("canvas");
  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not create the image.");
  ctx.drawImage(img, 0, 0);

  const fontScale = editOptions?.fontScale ?? 1;
  const fontSize = Math.round(canvas.width * 0.055 * fontScale);
  const fontStack = `700 ${fontSize}px "Inter", "Plus Jakarta Sans", sans-serif`;
  ctx.font = fontStack;

  // undefined -> brand color, null -> explicit black, string -> that color
  const effectiveColor = editOptions?.barColorOverride !== undefined ? editOptions.barColorOverride : brandKit?.color;
  const barRgb = effectiveColor ? hexToRgb(effectiveColor) : { r: 0, g: 0, b: 0 };
  const textColor = effectiveColor && isLight(barRgb) ? "#1a1a1a" : "#ffffff";
  const rgb = `${barRgb.r},${barRgb.g},${barRgb.b}`;

  if (editOptions?.textBox) {
    // Freeform mode (user dragged the caption in the drag-and-drop
    // editor) — a solid rounded panel that can sit anywhere, since the
    // edge-fade gradient below only makes visual sense anchored to an
    // actual image edge.
    const box = editOptions.textBox;
    const boxX = box.x * canvas.width;
    const boxY = box.y * canvas.height;
    const boxWidth = box.width * canvas.width;
    const padding = fontSize * 0.7;
    const maxTextWidth = boxWidth - padding * 2;
    const lines = wrapText(ctx, caption, maxTextWidth).slice(0, 5);
    const lineHeight = fontSize * 1.35;
    const boxHeight = lines.length * lineHeight + padding * 2;

    ctx.fillStyle = `rgba(${rgb},0.88)`;
    ctx.beginPath();
    ctx.roundRect(boxX, boxY, boxWidth, boxHeight, fontSize * 0.3);
    ctx.fill();

    ctx.fillStyle = textColor;
    ctx.textBaseline = "top";
    let y = boxY + padding;
    for (const line of lines) {
      const lineWidth = ctx.measureText(line).width;
      ctx.fillText(line, boxX + (boxWidth - lineWidth) / 2, y);
      y += lineHeight;
    }
  } else {
    const maxTextWidth = canvas.width * 0.88;
    const lines = wrapText(ctx, caption, maxTextWidth).slice(0, 5);
    const lineHeight = fontSize * 1.35;
    const padding = fontSize * 0.8;
    const barHeight = lines.length * lineHeight + padding * 2;
    const barAtTop = editOptions?.barPosition === "top";

    // The bar always fades from transparent (blending into the photo, at
    // whichever edge is closest to the photo's center) to solid (at the
    // actual image edge) — mirrored depending on which edge the bar sits on.
    const barY = barAtTop ? 0 : canvas.height - barHeight;
    const gradient = barAtTop
      ? ctx.createLinearGradient(0, 0, 0, barHeight)
      : ctx.createLinearGradient(0, canvas.height - barHeight, 0, canvas.height);
    if (barAtTop) {
      gradient.addColorStop(0, `rgba(${rgb},0.92)`);
      gradient.addColorStop(0.35, `rgba(${rgb},0.8)`);
      gradient.addColorStop(1, `rgba(${rgb},0)`);
    } else {
      gradient.addColorStop(0, `rgba(${rgb},0)`);
      gradient.addColorStop(0.35, `rgba(${rgb},0.8)`);
      gradient.addColorStop(1, `rgba(${rgb},0.92)`);
    }
    ctx.fillStyle = gradient;
    ctx.fillRect(0, barY, canvas.width, barHeight);

    ctx.font = fontStack;
    ctx.fillStyle = textColor;
    ctx.textBaseline = "top";
    let y = barY + padding;
    for (const line of lines) {
      const lineWidth = ctx.measureText(line).width;
      ctx.fillText(line, (canvas.width - lineWidth) / 2, y);
      y += lineHeight;
    }
  }

  if (brandKit?.logoDataUrl && editOptions?.showLogo !== false) {
    try {
      const logo = await loadImage(brandKit.logoDataUrl);
      if (editOptions?.logoBox) {
        const box = editOptions.logoBox;
        const logoW = box.width * canvas.width;
        const logoH = logoW * (logo.naturalHeight / logo.naturalWidth);
        const boxX = box.x * canvas.width;
        const boxY = box.y * canvas.height;
        const pad = logoW * 0.15;
        ctx.fillStyle = "rgba(255,255,255,0.92)";
        ctx.beginPath();
        ctx.roundRect(boxX, boxY, logoW + pad, logoH + pad, 10);
        ctx.fill();
        ctx.drawImage(logo, boxX + pad / 2, boxY + pad / 2, logoW, logoH);
      } else {
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
      }
    } catch {
      // Logo failed to load (corrupt data, etc.) — the post is still
      // useful without it, so this isn't worth failing the whole thing.
    }
  }

  drawWatermarkBadge(ctx, canvas.width, canvas.height);

  return canvas.toDataURL("image/jpeg", 0.92);
}

// Every generated ad gets posted publicly by the business that made it —
// a small badge turns each one into free organic distribution for us, at
// zero extra engineering cost since this one function already sits
// between every flow (Single Post, Weekly Plan, Carousel) and the final
// exported image. Unconditional for now since there's no paid tier yet
// to gate it behind (no payment flow exists) — making it removable for
// paying customers is a natural next step once one does. Placed top-right
// since the defaults put the logo top-left and the caption bar at the
// bottom edge; a user's own dragged caption/logo can still cover it, same
// tradeoff every watermarked tool accepts.
function drawWatermarkBadge(ctx: CanvasRenderingContext2D, canvasWidth: number, canvasHeight: number) {
  const badgeText = "Made with AdCreate.AI";
  const fontSize = Math.round(canvasWidth * 0.026);
  ctx.font = `600 ${fontSize}px "Inter", "Plus Jakarta Sans", sans-serif`;
  const textWidth = ctx.measureText(badgeText).width;
  const padX = fontSize * 0.65;
  const padY = fontSize * 0.5;
  const badgeW = textWidth + padX * 2;
  const badgeH = fontSize + padY * 2;
  const margin = canvasWidth * 0.025;
  const badgeX = canvasWidth - badgeW - margin;
  const badgeY = margin;

  ctx.fillStyle = "rgba(0,0,0,0.45)";
  ctx.beginPath();
  ctx.roundRect(badgeX, badgeY, badgeW, badgeH, badgeH / 2);
  ctx.fill();

  ctx.fillStyle = "rgba(255,255,255,0.92)";
  ctx.textBaseline = "middle";
  ctx.fillText(badgeText, badgeX + padX, badgeY + badgeH / 2 + fontSize * 0.05);
}
