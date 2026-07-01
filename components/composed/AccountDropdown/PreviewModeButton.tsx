"use client";

import { useTransition } from "react";
import { useDropdownContext } from "@/components/atomic/BaseDropdown/BaseDropdown";
import { useProgress } from "@/lib/vendor/react-transition-progress";
import { Link } from "@/components/atomic";
import { enterPreviewMode } from "./actions";

export default function PreviewModeButton({ label }: { label: string }) {
  const dropdown = useDropdownContext();

  const startProgress = useProgress();

  const [, startTransition] = useTransition();

  const handleClick = () => {
    dropdown?.hide();

    startTransition(async () => {
      startProgress();
      await enterPreviewMode();
      // Hard reload rather than router.refresh() to recover from notFound()
      window.location.reload();
    });
  };

  return (
    <Link as="button" type="button" onClick={handleClick}>
      {label}
    </Link>
  );
}
