"use client";

import { useTransition, useEffect, useRef } from "react";
import { useDropdownContext } from "@/components/atomic/BaseDropdown/BaseDropdown";
import { useProgress } from "@/lib/vendor/react-transition-progress";
import { Link } from "@/components/atomic";
import { enterPreviewMode } from "./actions";

export default function PreviewModeButton({ label }: { label: string }) {
  const dropdown = useDropdownContext();
  const startProgress = useProgress();

  const [isPending, startTransition] = useTransition();
  const pendingRef = useRef(false);

  const handleClick = () => {
    dropdown?.hide();

    startTransition(async () => {
      startProgress();
      await enterPreviewMode();
    });
  };

  useEffect(() => {
    if (isPending && !pendingRef.current) {
      pendingRef.current = true;
      return;
    }
    if (!isPending && pendingRef.current) {
      pendingRef.current = false;
      window.location.reload();
      return;
    }
  }, [isPending]);

  return (
    <Link as="button" type="button" onClick={handleClick}>
      {label}
    </Link>
  );
}
