"use client";

import { useTransition, useEffect, useRef } from "react";
import { useDropdownContext } from "@/components/atomic/BaseDropdown/BaseDropdown";
import { useRouter } from "@/lib/routing/hooks";
import { Link } from "@/components/atomic";
import { enterPreviewMode } from "./actions";

export default function PreviewModeButton({ label }: { label: string }) {
  const dropdown = useDropdownContext();
  const router = useRouter();

  const [isPending, startTransition] = useTransition();
  const pendingRef = useRef(false);

  const handleClick = () => {
    dropdown?.hide();

    startTransition(async () => {
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
      // Soft navigation (not a hard reload) so the ClientRouter loading bar
      // animates while the server re-renders with the new draft cookie.
      router.refresh();
      return;
    }
  }, [isPending, router]);

  return (
    <Link as="button" type="button" onClick={handleClick}>
      {label}
    </Link>
  );
}
