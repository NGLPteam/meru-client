"use client";

// Provider wrapper for the footer's per-viewer nav. Seeds ViewerContext (+ i18n)
// from the server viewer resolved in FooterNav.astro. With no `viewer` it renders
// the anonymous fallback (Home + Sign in). Mirrors AccountDropdownIsland.
import AccountProviders from "@/components/chrome/AccountNav/AccountProviders";
import type { ViewerContextProps } from "@/contexts/ViewerContext/ViewerContext";
import FooterNavContent from "./FooterNavContent";

type Props = {
  viewer?: ViewerContextProps;
  isPreview?: boolean;
};

export default function FooterNavIsland({ viewer, isPreview }: Props) {
  return (
    <AccountProviders viewer={viewer} isPreview={isPreview}>
      <FooterNavContent />
    </AccountProviders>
  );
}
