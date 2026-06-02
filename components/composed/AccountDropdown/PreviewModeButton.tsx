"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { useDropdownContext } from "@/components/atomic/BaseDropdown/BaseDropdown";
import { useProgress } from "@/lib/vendor/react-transition-progress";
import { Link } from "@/components/atomic";
import { enterPreviewMode } from "./actions";

export default function PreviewModeButton({ label }: { label: string }) {
  const dropdown = useDropdownContext();

  const router = useRouter();

  const startProgress = useProgress();

  const [, startTransition] = useTransition();

  const handleClick = () => {
    dropdown?.hide();

    startTransition(async () => {
      startProgress();
      await enterPreviewMode();
      router.refresh();
    });
  };

  return (
    <Link as="button" onClick={handleClick}>
      {label}
    </Link>
  );
}
