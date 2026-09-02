import { useEffect, useState } from "react";

// Gate for browser-only rendering (reakit popovers, react-pdf, Google Charts):
// false during SSR, flips true after hydration. Only valid INSIDE a hydrating
// island — in a static (never-hydrated) React tree it stays false forever and
// permanently hides the gated content.
export default function useIsMounted(): boolean {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, [setIsMounted]);

  return isMounted;
}
