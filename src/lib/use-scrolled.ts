import { useEffect, useState } from "react";

// Drives glass-nav surfaces' scroll-aware opacity (see .glass-nav /
// .glass-nav-scrolled in styles.css) — more see-through at the very
// top of the page, slightly more opaque once scrolled.
export function useScrolled(threshold = 8) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > threshold);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [threshold]);
  return scrolled;
}
