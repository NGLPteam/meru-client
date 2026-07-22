"use client";

// Hydrated leaf of the AccountNav `server:defer` island: the interactive account
// menu (avatar/name dropdown, admin link, preview-mode toggle, sign-out) or the
// sign-in link. Wraps the unchanged AccountDropdown in the minimal account
// provider stack, seeded with the per-request viewer resolved server-side.
import AccountDropdown from "@/components/composed/AccountDropdown";
import type { ViewerContextProps } from "@/contexts/ViewerContext/ViewerContext";
import AccountProviders from "./AccountProviders";

type Props = {
  viewer?: ViewerContextProps;
  isPreview?: boolean;
  condensed?: boolean;
  mobile?: boolean;
};

export default function AccountDropdownIsland({
  viewer,
  isPreview,
  condensed,
  mobile,
}: Props) {
  return (
    <AccountProviders viewer={viewer} isPreview={isPreview}>
      <AccountDropdown condensed={condensed} mobile={mobile} />
    </AccountProviders>
  );
}
