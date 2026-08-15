import { useEffect, useRef, useState } from "react";
import { AlertCircle, Camera, ChevronDown, Download, Link2, Loader2, Megaphone, Sparkles } from "lucide-react";
import {
  base64ToFile,
  enhanceImage,
  fetchProductLink,
  generateAd,
  generateAdImageVariant,
  removeBackground,
  translateCaptions,
  type ApiAdCaptionVariant,
} from "@/lib/api";
import { compositeImage } from "@/lib/canvas-text";
import { exportAdSizes, type AdSizeExports } from "@/lib/image-export";
import { CaptionPicker } from "./CaptionPicker";
import { ImageVariantPicker } from "./ImageVariantPicker";
import { TranslateCaptions } from "./TranslateCaptions";

export function SinglePostForm({
  credits,
  setCredits,
}: {
  credits: number | null;
  setCredits: (n: number) => void;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [useAiImage, setUseAiImage] = useState(false);
  const [description, setDescription] = useState("");
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [productUrl, setProductUrl] = useState("");
  const [fetchingLink, setFetchingLink] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [generatingImage, setGeneratingImage] = useState(false);
  const [removingBackground, setRemovingBackground] = useState(false);
  const [enhancing, setEnhancing] = useState(false);
  const [translating, setTranslating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [captions, setCaptions] = useState<ApiAdCaptionVariant[]>([]);
  const [images, setImages] = useState<string[]>([]);
  const [selectedCaptionIndex, setSelectedCaptionIndex] = useState(0);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [compositedUrl, setCompositedUrl] = useState<string | null>(null);
  const [exportSizes, setExportSizes] = useState<AdSizeExports | null>(null);
  const [showMoreSizes, setShowMoreSizes] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const hasResult = captions.length > 0 && images.length > 0;

  // Recomposites (cheap, client-side canvas draw) whenever the user
  // switches which caption or which background image they want to use —
  // no new AI call needed, the text/image are already generated.
  useEffect(() => {
    if (!hasResult) return;
    compositeImage(images[selectedImageIndex], captions[selectedCaptionIndex].facebook_caption)
      .then(setCompositedUrl)
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [images, captions, selectedImageIndex, selectedCaptionIndex]);

  // Also free/client-side — regenerates the feed/story crops whenever the
  // composited image changes, so the download options are always ready.
  useEffect(() => {
    if (!compositedUrl) {
      setExportSizes(null);
      return;
    }
    exportAdSizes(compositedUrl)
      .then(setExportSizes)
      .catch(() => setExportSizes(null));
  }, [compositedUrl]);

  // Revoke the previous object URL before creating a new one so switching
  // photos doesn't leak blob URLs for the lifetime of this screen.
  const handleFileChange = (f: File | null) => {
    setPreviewUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return f ? URL.createObjectURL(f) : null;
    });
    setFile(f);
    if (f) setUseAiImage(false);
  };

  const handleUseAiImage = () => {
    handleFileChange(null);
    setUseAiImage(true);
  };

  const hasImageSource = !!file || useAiImage;

  const handleGenerate = async () => {
    if (!hasImageSource || !description.trim() || generating) return;
    setGenerating(true);
    setError(null);
    try {
      const r = await generateAd(description.trim(), useAiImage ? null : file);
      setCaptions(r.captions);
      setImages([r.banner_image_base64]);
      setSelectedCaptionIndex(0);
      setSelectedImageIndex(0);
      setCredits(r.credits_remaining);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't generate the ad.");
    } finally {
      setGenerating(false);
    }
  };

  const handleGenerateMoreImages = async () => {
    if (!hasImageSource || generatingImage || (credits !== null && credits <= 0)) return;
    setGeneratingImage(true);
    setError(null);
    try {
      const r = await generateAdImageVariant(description.trim(), useAiImage ? null : file);
      setImages((prev) => [...prev, r.banner_image_base64]);
      setSelectedImageIndex(images.length);
      setCredits(r.credits_remaining);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't generate a new image.");
    } finally {
      setGeneratingImage(false);
    }
  };

  const handleFetchProductLink = async () => {
    if (!productUrl.trim() || fetchingLink) return;
    setFetchingLink(true);
    setError(null);
    try {
      const r = await fetchProductLink(productUrl.trim());
      setDescription([r.title, r.description].filter(Boolean).join(" — "));
      if (r.image_base64) {
        handleFileChange(base64ToFile(r.image_base64, r.mime_type || "image/jpeg", "product.jpg"));
      } else {
        handleUseAiImage();
      }
      setShowLinkInput(false);
      setProductUrl("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't fetch that link.");
    } finally {
      setFetchingLink(false);
    }
  };

  const handleRemoveBackground = async () => {
    if (removingBackground || (credits !== null && credits <= 0)) return;
    setRemovingBackground(true);
    setError(null);
    try {
      const r = await removeBackground(images[selectedImageIndex]);
      setImages((prev) => [...prev, r.banner_image_base64]);
      setSelectedImageIndex(images.length);
      setCredits(r.credits_remaining);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't remove the background.");
    } finally {
      setRemovingBackground(false);
    }
  };

  const handleEnhance = async () => {
    if (enhancing || (credits !== null && credits <= 0)) return;
    setEnhancing(true);
    setError(null);
    try {
      const r = await enhanceImage(images[selectedImageIndex]);
      setImages((prev) => [...prev, r.banner_image_base64]);
      setSelectedImageIndex(images.length);
      setCredits(r.credits_remaining);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't enhance the image.");
    } finally {
      setEnhancing(false);
    }
  };

  const handleTranslate = async (language: string) => {
    if (translating) return;
    setTranslating(true);
    setError(null);
    try {
      const r = await translateCaptions(captions, language);
      setCaptions((prev) => [...prev, ...r.captions]);
      setSelectedCaptionIndex(captions.length);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't translate the captions.");
    } finally {
      setTranslating(false);
    }
  };

  const handleReset = () => {
    setCaptions([]);
    setImages([]);
    setSelectedCaptionIndex(0);
    setSelectedImageIndex(0);
    setCompositedUrl(null);
    setExportSizes(null);
    setShowMoreSizes(false);
    handleFileChange(null);
    setUseAiImage(false);
    setDescription("");
    setShowLinkInput(false);
    setProductUrl("");
    setError(null);
  };

  return (
    <>
      {!hasResult && (
        <>
          {credits !== null && credits <= 0 && (
            <div className="mb-5 rounded-2xl border border-dashed border-accent/40 bg-accent/5 p-4 text-sm text-foreground">
              You're out of credits. Upgrade to keep generating.
            </div>
          )}

          <div className="mb-5">
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Product photo
            </label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={(e) => handleFileChange(e.target.files?.[0] ?? null)}
            />
            {useAiImage ? (
              <div
                className="flex w-full flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-primary/40 bg-primary/5 p-6 text-center"
                style={{ minHeight: "10rem" }}
              >
                <Sparkles className="h-8 w-8 text-primary" />
                <span className="text-sm font-semibold text-foreground">AI will generate the image</span>
                <button
                  onClick={() => setUseAiImage(false)}
                  className="text-xs font-semibold text-primary underline-offset-2 hover:underline"
                >
                  No, I'll add my own photo
                </button>
              </div>
            ) : (
              <>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex w-full flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-border bg-card p-6 text-center transition-colors active:bg-secondary/40"
                  style={{ minHeight: previewUrl ? undefined : "10rem" }}
                >
                  {previewUrl ? (
                    <img
                      src={previewUrl}
                      alt="Product photo"
                      className="max-h-56 rounded-xl object-contain"
                    />
                  ) : (
                    <>
                      <Camera className="h-8 w-8 text-muted-foreground" />
                      <span className="text-sm font-semibold text-muted-foreground">
                        Take or choose a photo
                      </span>
                    </>
                  )}
                </button>
                {!previewUrl && (
                  <div className="mt-2 flex flex-col items-center gap-2">
                    <button
                      onClick={handleUseAiImage}
                      className="text-xs font-semibold text-primary underline-offset-2 hover:underline"
                    >
                      No photo? Generate one with AI
                    </button>
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
                  </div>
                )}
              </>
            )}
          </div>

          <div className="mb-6">
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              What's the post about?
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. New summer collection, 20% off this week"
              rows={3}
              className="w-full rounded-2xl border border-input bg-background px-4 py-3 text-base text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          {error && (
            <p className="mb-4 flex items-center gap-1.5 text-sm font-medium text-destructive">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {error}
            </p>
          )}

          <button
            onClick={handleGenerate}
            disabled={
              !hasImageSource ||
              !description.trim() ||
              generating ||
              (credits !== null && credits <= 0)
            }
            className="flex w-full items-center justify-center gap-2 rounded-full px-5 py-4 text-base font-semibold text-primary-foreground disabled:opacity-60"
            style={{ background: "var(--gradient-primary)" }}
          >
            {generating ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Megaphone className="h-5 w-5" />
                Generate ad (1 credit)
              </>
            )}
          </button>
        </>
      )}

      {hasResult && (
        <>
          <div
            className="mb-3 overflow-hidden rounded-2xl bg-card"
            style={{ boxShadow: "var(--shadow-card)" }}
          >
            {compositedUrl && (
              <img src={compositedUrl} alt="Generated ad" className="w-full" />
            )}
          </div>

          <ImageVariantPicker
            images={images}
            selectedIndex={selectedImageIndex}
            onSelect={setSelectedImageIndex}
            onGenerateMore={handleGenerateMoreImages}
            onRemoveBackground={handleRemoveBackground}
            onEnhance={handleEnhance}
            generating={generatingImage}
            removingBackground={removingBackground}
            enhancing={enhancing}
            disabled={credits !== null && credits <= 0}
          />

          <CaptionPicker
            captions={captions}
            selectedIndex={selectedCaptionIndex}
            onSelect={setSelectedCaptionIndex}
          />

          <TranslateCaptions onTranslate={handleTranslate} translating={translating} />

          <div className="mb-6 rounded-2xl bg-card p-4" style={{ boxShadow: "var(--shadow-card)" }}>
            <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              WhatsApp message
            </p>
            <p className="text-sm text-foreground">
              {captions[selectedCaptionIndex].whatsapp_message}
            </p>
          </div>

          {error && (
            <p className="mb-4 flex items-center gap-1.5 text-sm font-medium text-destructive">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {error}
            </p>
          )}

          <a
            href={exportSizes?.square ?? compositedUrl ?? undefined}
            download="ad-square.jpg"
            className="mb-2 flex w-full items-center justify-center gap-2 rounded-full px-5 py-4 text-base font-semibold text-primary-foreground"
            style={{ background: "var(--gradient-primary)" }}
          >
            <Download className="h-5 w-5" />
            Download image (Square)
          </a>
          {!showMoreSizes ? (
            <button
              onClick={() => setShowMoreSizes(true)}
              className="mb-3 flex w-full items-center justify-center gap-1 text-xs font-semibold text-muted-foreground"
            >
              More sizes (Feed, Story)
              <ChevronDown className="h-3.5 w-3.5" />
            </button>
          ) : (
            <div className="mb-3 flex gap-2">
              <a
                href={exportSizes?.feed}
                download="ad-feed.jpg"
                className="flex flex-1 items-center justify-center gap-1.5 rounded-full bg-secondary px-3 py-2.5 text-xs font-semibold text-secondary-foreground"
              >
                <Download className="h-3.5 w-3.5" />
                Feed (4:5)
              </a>
              <a
                href={exportSizes?.story}
                download="ad-story.jpg"
                className="flex flex-1 items-center justify-center gap-1.5 rounded-full bg-secondary px-3 py-2.5 text-xs font-semibold text-secondary-foreground"
              >
                <Download className="h-3.5 w-3.5" />
                Story (9:16)
              </a>
            </div>
          )}
          <button
            onClick={handleReset}
            className="w-full rounded-full bg-secondary px-5 py-3 text-sm font-semibold text-secondary-foreground"
          >
            Create another
          </button>
        </>
      )}
    </>
  );
}
