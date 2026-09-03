"use client";

// client:only entry: initializes i18n in the browser bundle (the viewer's
// strings come from useTranslation until the Phase 8 label-prop cut).
import "@/i18n";

export { default } from "./AssetInlinePDF";
