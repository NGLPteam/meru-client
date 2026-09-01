"use client";

// Hydrated variant of MainLayout for items whose full-text body is a PDF
// embed: the PDF viewer (react-pdf) is a clientOnly component, so it renders
// nothing inside the statically-rendered tree — the layout must hydrate. Only
// mounted for PDF items (see hasPDFFullText); their props stay small because
// the body slot is a single tag rather than prose.
import "@/i18n";
import { RouteProvider, type RouteState } from "@/lib/routing/RouteContext";
import MainLayout from "./MainLayout";
import type { ComponentProps } from "react";

type Props = ComponentProps<typeof MainLayout> & {
  route?: Partial<RouteState>;
};

export default function MainLayoutIsland({ route, ...props }: Props) {
  return (
    <RouteProvider route={route}>
      <MainLayout {...props} />
    </RouteProvider>
  );
}
