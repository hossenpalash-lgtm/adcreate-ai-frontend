import { ImageIcon, Loader2, Search } from "lucide-react";
import { useState } from "react";
import { base64ToFile, fetchStockPhoto, searchStockPhotos, type ApiStockPhotoResult } from "@/lib/api";

// A fourth photo source alongside upload / AI-generate / product-link —
// free (no AI call), just a search proxy to Pexels. Only the small
// preview thumbnails are fetched during search; the full image is only
// downloaded once the user actually picks one, to avoid pulling full-res
// photos for results they never use.
export function StockPhotoSearch({ onSelect }: { onSelect: (file: File) => void }) {
  const [expanded, setExpanded] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<ApiStockPhotoResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [selectingId, setSelectingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async () => {
    if (!query.trim() || searching) return;
    setSearching(true);
    setError(null);
    try {
      const r = await searchStockPhotos(query.trim());
      setResults(r.results);
      if (r.results.length === 0) setError("No photos found for that search.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't search stock photos.");
    } finally {
      setSearching(false);
    }
  };

  const handlePick = async (photo: ApiStockPhotoResult) => {
    if (selectingId) return;
    setSelectingId(photo.id);
    setError(null);
    try {
      const r = await fetchStockPhoto(photo.full_url);
      onSelect(base64ToFile(r.image_base64, r.mime_type, "stock-photo.jpg"));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't use that photo.");
    } finally {
      setSelectingId(null);
    }
  };

  if (!expanded) {
    return (
      <button
        onClick={() => setExpanded(true)}
        className="flex items-center gap-1 text-xs font-semibold text-primary underline-offset-2 hover:underline"
      >
        <ImageIcon className="h-3 w-3" />
        Or choose a stock photo
      </button>
    );
  }

  return (
    <div className="w-full">
      <div className="mb-2 flex gap-2">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          placeholder="e.g. coffee cup, sneakers, yoga"
          disabled={searching}
          className="flex-1 rounded-full border border-input bg-background px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        />
        <button
          onClick={handleSearch}
          disabled={!query.trim() || searching}
          className="flex shrink-0 items-center justify-center gap-1 rounded-full bg-secondary px-3 py-2 text-xs font-semibold text-secondary-foreground disabled:opacity-60"
        >
          {searching ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Search className="h-3.5 w-3.5" />}
        </button>
      </div>

      {error && <p className="mb-2 text-xs font-medium text-destructive">{error}</p>}

      {results.length > 0 && (
        <div className="mb-2 grid grid-cols-3 gap-2">
          {results.map((photo) => (
            <button
              key={photo.id}
              onClick={() => handlePick(photo)}
              disabled={!!selectingId}
              className="relative aspect-square overflow-hidden rounded-lg disabled:opacity-60"
            >
              <img src={photo.thumbnail_url} alt={photo.photographer} className="h-full w-full object-cover" />
              {selectingId === photo.id && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                  <Loader2 className="h-4 w-4 animate-spin text-white" />
                </div>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
