"use client";

// Minimal provider stack for the per-viewer account island (AccountDropdown +
// PreviewModeButton). Rendered inside the AccountNav `server:defer` island, so
// the `viewer` it seeds is resolved per-request and never lands in cached HTML.
//
// Only what the account UI consumes: the i18next singleton (side-effect import)
// and ViewerContext (seeded from the server viewer). No Route/Community/Theme
// context — the account menu needs none of them.
import "@/i18n";
import {
  ViewerContextProvider,
  type ViewerContextProps,
} from "@/contexts/ViewerContext/ViewerContext";
import type { PropsWithChildren } from "react";

type Props = PropsWithChildren<{
  viewer?: ViewerContextProps;
  isPreview?: boolean;
}>;

export default function AccountProviders({
  children,
  viewer,
  isPreview,
}: Props) {
  return (
    <ViewerContextProvider viewer={viewer} isPreview={isPreview}>
      {children}
    </ViewerContextProvider>
  );
}
