import { AlertCircle, Calendar, Check, Download } from "lucide-react";
import type { ApiAdCaptionVariant, CaptionLength, CaptionTone } from "@/lib/api";
import type { Box, BrandKit, EditOptions } from "@/lib/canvas-text";
import { CaptionPicker } from "./CaptionPicker";
import { CaptionStyleControls } from "./CaptionStyleControls";
import { CarouselBuilder } from "./CarouselBuilder";
import { DragDropEditor } from "./DragDropEditor";
import { HashtagPicker } from "./HashtagPicker";
import { ImageVariantPicker } from "./ImageVariantPicker";
import { QuickEditPanel } from "./QuickEditPanel";
import { TranslateCaptions } from "./TranslateCaptions";

// The result screen — everything SinglePostForm's old flat result view
// already had (image variants, caption picker, quick edit, drag-drop
// editor, hashtags, translate, carousel, download), reframed as a "Post
// Kit" with a real (not fabricated) readiness checklist and tone/length
// caption controls on top. No creative score or "best time" section —
// nothing in the backend calculates either, and the brief is explicit
// about not fabricating metrics. Schedule is a disabled placeholder since
// no Facebook/Instagram posting feature exists yet.
export function PostKit({
  compositedUrl,
  textBox,
  onTextBoxChange,
  logoBox,
  onLogoBoxChange,
  hasLogo,
  showLogo,
  onShowLogoChange,
  images,
  selectedImageIndex,
  onSelectImage,
  onGenerateMoreImages,
  onRemoveBackground,
  onEnhance,
  generatingImage,
  removingBackground,
  enhancing,
  outOfCredits,
  captions,
  selectedCaptionIndex,
  onSelectCaption,
  captionTone,
  onCaptionToneChange,
  captionLength,
  onCaptionLengthChange,
  onGenerateAnotherCaption,
  regeneratingCaptions,
  onTranslate,
  translating,
  editedCaption,
  onCaptionChange,
  fontScale,
  onFontScaleChange,
  barColorOverride,
  onBarColorOverrideChange,
  itemDescription,
  onAppendHashtag,
  brandKit,
  editOptions,
  whatsappMessage,
  error,
  onReset,
}: {
  compositedUrl: string | null;
  textBox: Box | undefined;
  onTextBoxChange: (b: Box | undefined) => void;
  logoBox: Box | undefined;
  onLogoBoxChange: (b: Box | undefined) => void;
  hasLogo: boolean;
  showLogo: boolean;
  onShowLogoChange: (v: boolean) => void;
  images: string[];
  selectedImageIndex: number;
  onSelectImage: (i: number) => void;
  onGenerateMoreImages: () => void;
  onRemoveBackground: () => void;
  onEnhance: () => void;
  generatingImage: boolean;
  removingBackground: boolean;
  enhancing: boolean;
  outOfCredits: boolean;
  captions: ApiAdCaptionVariant[];
  selectedCaptionIndex: number;
  onSelectCaption: (i: number) => void;
  captionTone: CaptionTone;
  onCaptionToneChange: (t: CaptionTone) => void;
  captionLength: CaptionLength;
  onCaptionLengthChange: (l: CaptionLength) => void;
  onGenerateAnotherCaption: () => void;
  regeneratingCaptions: boolean;
  onTranslate: (language: string) => void;
  translating: boolean;
  editedCaption: string;
  onCaptionChange: (text: string) => void;
  fontScale: number;
  onFontScaleChange: (n: number) => void;
  barColorOverride: string | null | undefined;
  onBarColorOverrideChange: (c: string | null | undefined) => void;
  itemDescription: string;
  onAppendHashtag: (tag: string) => void;
  brandKit: BrandKit;
  editOptions: EditOptions;
  whatsappMessage: string;
  error: string | null;
  onReset: () => void;
}) {
  const hashtagsAdded = editedCaption.includes("#");

  return (
    <>
      {compositedUrl && (
        <DragDropEditor
          imageUrl={compositedUrl}
          textBox={textBox}
          onTextBoxChange={onTextBoxChange}
          logoBox={logoBox}
          onLogoBoxChange={onLogoBoxChange}
          hasLogo={hasLogo}
          showLogo={showLogo}
        />
      )}

      {/* Real-only readiness checklist — every row is a true/false fact
          about generated state, never an invented quality score. */}
      <div className="mb-5 grid grid-cols-3 gap-2">
        {[
          { label: "Image", ready: images.length > 0 },
          { label: "Caption", ready: captions.length > 0 },
          { label: "Hashtags", ready: hashtagsAdded },
        ].map(({ label, ready }) => (
          <div
            key={label}
            className="flex flex-col items-center gap-1 rounded-xl bg-card py-2.5"
            style={{ boxShadow: "var(--shadow-card)" }}
          >
            <span
              className={[
                "flex h-5 w-5 items-center justify-center rounded-full",
                ready ? "bg-success/15 text-success" : "bg-secondary text-muted-foreground",
              ].join(" ")}
            >
              <Check className="h-3 w-3" />
            </span>
            <span className="text-[11px] font-semibold text-foreground">{label}</span>
          </div>
        ))}
      </div>

      <ImageVariantPicker
        images={images}
        selectedIndex={selectedImageIndex}
        onSelect={onSelectImage}
        onGenerateMore={onGenerateMoreImages}
        onRemoveBackground={onRemoveBackground}
        onEnhance={onEnhance}
        generating={generatingImage}
        removingBackground={removingBackground}
        enhancing={enhancing}
        disabled={outOfCredits}
      />

      <CaptionPicker captions={captions} selectedIndex={selectedCaptionIndex} onSelect={onSelectCaption} />

      <CaptionStyleControls
        tone={captionTone}
        onToneChange={onCaptionToneChange}
        length={captionLength}
        onLengthChange={onCaptionLengthChange}
        onGenerateAnother={onGenerateAnotherCaption}
        generating={regeneratingCaptions}
      />

      <TranslateCaptions onTranslate={onTranslate} translating={translating} />

      <QuickEditPanel
        captionText={editedCaption}
        onCaptionChange={onCaptionChange}
        fontScale={fontScale}
        onFontScaleChange={onFontScaleChange}
        barColorOverride={barColorOverride}
        onBarColorOverrideChange={onBarColorOverrideChange}
        hasLogo={hasLogo}
        showLogo={showLogo}
        onShowLogoChange={onShowLogoChange}
      />

      <HashtagPicker itemDescription={itemDescription} onAppend={onAppendHashtag} />

      <CarouselBuilder images={images} caption={editedCaption} brandKit={brandKit} editOptions={editOptions} />

      <div className="mb-6 rounded-2xl bg-card p-4" style={{ boxShadow: "var(--shadow-card)" }}>
        <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">WhatsApp message</p>
        <p className="text-sm text-foreground">{whatsappMessage}</p>
      </div>

      {error && (
        <p className="mb-4 flex items-center gap-1.5 text-sm font-medium text-destructive">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </p>
      )}

      <a
        href={compositedUrl ?? undefined}
        download="post.jpg"
        className="mb-3 flex w-full items-center justify-center gap-2 rounded-full px-5 py-4 text-base font-semibold text-primary-foreground"
        style={{ background: "var(--gradient-primary)" }}
      >
        <Download className="h-5 w-5" />
        Download image
      </a>

      <button
        disabled
        title="Coming soon"
        className="mb-3 flex w-full items-center justify-center gap-2 rounded-full bg-secondary px-5 py-3 text-sm font-semibold text-secondary-foreground opacity-60 disabled:cursor-not-allowed"
      >
        <Calendar className="h-4 w-4" />
        Schedule — coming soon
      </button>

      <button
        onClick={onReset}
        className="w-full rounded-full bg-secondary px-5 py-3 text-sm font-semibold text-secondary-foreground"
      >
        Create another
      </button>
    </>
  );
}
