"use client";

// Island for the unauthorized page — just needs i18n (UnauthorizedMessage uses
// useTranslation/Trans), so it initializes the singleton and renders the
// message. No provider stack required.
import "@/i18n";
import UnauthorizedMessage from "@/components/composed/UnauthorizedMessage";

export default function UnauthorizedContent({ reason }: { reason?: string }) {
  return <UnauthorizedMessage reason={reason} />;
}
