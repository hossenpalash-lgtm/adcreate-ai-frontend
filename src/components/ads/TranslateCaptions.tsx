import { Languages, Loader2 } from "lucide-react";
import { useState } from "react";

// Free — translation is a cheap text-only call reusing captions already
// paid for by the original generation, so there's no credit cost shown
// here (unlike the image tools next to it).
const LANGUAGES = [
  "Spanish",
  "French",
  "Portuguese",
  "Arabic",
  "Hindi",
  "Bengali",
  "Indonesian",
  "German",
];

export function TranslateCaptions({
  onTranslate,
  translating,
}: {
  onTranslate: (language: string) => void;
  translating: boolean;
}) {
  const [language, setLanguage] = useState(LANGUAGES[0]);

  return (
    <div className="mb-4 flex items-center gap-2">
      <select
        value={language}
        onChange={(e) => setLanguage(e.target.value)}
        disabled={translating}
        className="flex-1 rounded-full border border-input bg-background px-3 py-2.5 text-xs font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
      >
        {LANGUAGES.map((l) => (
          <option key={l} value={l}>
            {l}
          </option>
        ))}
      </select>
      <button
        onClick={() => onTranslate(language)}
        disabled={translating}
        className="flex items-center justify-center gap-1.5 whitespace-nowrap rounded-full bg-secondary px-3 py-2.5 text-xs font-semibold text-secondary-foreground disabled:opacity-60"
      >
        {translating ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <Languages className="h-3.5 w-3.5" />
        )}
        Translate
      </button>
    </div>
  );
}
