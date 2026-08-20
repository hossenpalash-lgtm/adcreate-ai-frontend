import { ArrowLeft, ArrowRight, Camera, Link2, Loader2, Sparkles } from "lucide-react";
import { useState } from "react";
import { base64ToFile, fetchProductLink } from "@/lib/api";
import { ProductPicker } from "./ProductPicker";
import { StockPhotoSearch } from "./StockPhotoSearch";

// Step 3 — three simple choices instead of a generic media uploader.
// Reuses the exact same upload/AI-image/product-link/stock/catalog
// pipeline SinglePostForm already had — just reframed as one decision
// ("where's the visual coming from") instead of a form field.
export function VisualSourceStep({
  file,
  previewUrl,
  useAiImage,
  onFileChange,
  onUseAiImage,
  onDescriptionOverride,
  onContinue,
  onBack,
}: {
  file: File | null;
  previewUrl: string | null;
  useAiImage: boolean;
  onFileChange: (f: File | null) => void;
  onUseAiImage: () => void;
  onDescriptionOverride: (text: string) => void;
  onContinue: () => void;
  onBack: () => void;
}) {
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [productUrl, setProductUrl] = useState("");
  const [fetchingLink, setFetchingLink] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const hasSource = !!file || useAiImage;

  const handleFetchProductLink = async () => {
    if (!productUrl.trim() || fetchingLink) return;
    setFetchingLink(true);
    setError(null);
    try {
      const r = await fetchProductLink(productUrl.trim());
      onDescriptionOverride([r.title, r.description].filter(Boolean).join(" — "));
      if (r.image_base64) {
        onFileChange(base64ToFile(r.image_base64, r.mime_type || "image/jpeg", "product.jpg"));
      } else {
        onUseAiImage();
      }
      setShowLinkInput(false);
      setProductUrl("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't fetch that link.");
    } finally {
      setFetchingLink(false);
    }
  };

  return (
    <div className="flex flex-col items-center text-center">
      <h1 className="font-display mb-2 text-xl font-extrabold text-foreground">Choose your visual</h1>
      <p className="mb-6 text-sm text-muted-foreground">Where should the photo come from?</p>

      <div className="mb-4 grid w-full grid-cols-1 gap-2 sm:grid-cols-3">
        <button
          onClick={onUseAiImage}
          className={[
            "flex flex-col items-center gap-2 rounded-2xl border p-4 text-center",
            useAiImage ? "border-primary bg-primary/5" : "border-border bg-card",
          ].join(" ")}
          style={!useAiImage ? { boxShadow: "var(--shadow-card)" } : undefined}
        >
          <Sparkles className="h-6 w-6 text-primary" />
          <span className="text-xs font-semibold text-foreground">Let Punqle choose</span>
        </button>
        <label
          className={[
            "flex flex-col items-center gap-2 rounded-2xl border p-4 text-center",
            file ? "border-primary bg-primary/5" : "border-border bg-card",
          ].join(" ")}
          style={!file ? { boxShadow: "var(--shadow-card)" } : undefined}
        >
          <input
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={(e) => onFileChange(e.target.files?.[0] ?? null)}
          />
          <Camera className="h-6 w-6 text-muted-foreground" />
          <span className="text-xs font-semibold text-foreground">Upload my image</span>
        </label>
        <div
          className="flex flex-col items-center gap-2 rounded-2xl border border-border bg-card p-4 text-center"
          style={{ boxShadow: "var(--shadow-card)" }}
        >
          <StockPhotoSearch onSelect={onFileChange} />
        </div>
      </div>

      {previewUrl && (
        <img src={previewUrl} alt="Selected" className="mb-4 max-h-48 rounded-2xl object-contain" />
      )}

      <div className="mb-6 flex flex-col items-center gap-2">
        {!showLinkInput ? (
          <button
            onClick={() => setShowLinkInput(true)}
            className="flex items-center gap-1 text-xs font-semibold text-primary underline-offset-2 hover:underline"
          >
            <Link2 className="h-3 w-3" />
            Or paste a product link
          </button>
        ) : (
          <div className="flex w-full gap-2">
            <input
              type="url"
              value={productUrl}
              onChange={(e) => setProductUrl(e.target.value)}
              placeholder="https://yourstore.com/products/..."
              disabled={fetchingLink}
              className="flex-1 rounded-full border border-input bg-background px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
            <button
              onClick={handleFetchProductLink}
              disabled={!productUrl.trim() || fetchingLink}
              className="flex shrink-0 items-center justify-center gap-1 rounded-full bg-secondary px-3 py-2 text-xs font-semibold text-secondary-foreground disabled:opacity-60"
            >
              {fetchingLink ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Fetch"}
            </button>
          </div>
        )}
        <ProductPicker
          onSelect={(description, photoFile) => {
            onDescriptionOverride(description);
            if (photoFile) {
              onFileChange(photoFile);
            } else {
              onUseAiImage();
            }
          }}
        />
      </div>

      {error && <p className="mb-4 text-sm font-medium text-destructive">{error}</p>}

      <div className="flex w-full gap-2">
        <button
          onClick={onBack}
          className="flex items-center justify-center gap-1.5 rounded-full bg-secondary px-5 py-4 text-sm font-semibold text-secondary-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>
        <button
          onClick={onContinue}
          disabled={!hasSource}
          className="flex flex-1 items-center justify-center gap-2 rounded-full px-5 py-4 text-base font-semibold text-primary-foreground disabled:opacity-60"
          style={{ background: "var(--gradient-primary)" }}
        >
          Continue
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
