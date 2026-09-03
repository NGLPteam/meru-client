"use client";

// Slot content is compiled synchronously (evaluateSync) so it renders during
// server rendering — both static trees and island SSR — instead of appearing
// only after hydration. The same string compiles to the same tree on server and
// client, so hydration is mismatch-free.
import { t } from "@/lib/i18n";
import { evaluateSync } from "@mdx-js/mdx";
import * as runtime from "react/jsx-runtime";
import { renderToStaticMarkup } from "react-dom/server";
import remarkGfm from "remark-gfm";
import { ErrorBoundary } from "react-error-boundary";
import useViewerContext from "@/contexts/useViewerContext";
import NoContent from "@/components/layout/messages/NoContent";
import { blockSlotComponents } from "./components";
import AssetButton from "./components/AssetButton";
import ButtonLink from "./components/ButtonLink";
import { createElement } from "react";
import type { MDXComponents } from "mdx/types";

export default function BlockSlotWrapper({
  content,
  assetAsButton,
}: {
  content?: string | null;
  assetAsButton?: boolean;
}) {
  const { allowedActions } = useViewerContext();

  const isAdmin = allowedActions?.includes("admin.access");

  if (!content) return null;

  const components = (
    assetAsButton
      ? { ...blockSlotComponents, Asset: AssetButton, a: ButtonLink }
      : blockSlotComponents
  ) as MDXComponents;

  let Content;
  try {
    Content = evaluateSync(content, {
      ...runtime,
      remarkPlugins: [remarkGfm],
    }).default;
    // On the server, trial-render so a throwing MDX component degrades to the
    // error message below instead of failing the whole page render. (Client
    // render errors are caught by the ErrorBoundary instead.) createElement
    // rather than JSX: rendering here is eager, so the catch does see errors.
    if (import.meta.env.SSR) {
      renderToStaticMarkup(createElement(Content, { components }));
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return (
      <NoContent
        inline
        message={
          isAdmin
            ? t("messages.admin_content", { error: message })
            : t("messages.content")
        }
      />
    );
  }

  return (
    <ErrorBoundary
      fallbackRender={({ error }) => (
        <NoContent
          inline
          message={
            isAdmin
              ? t("messages.admin_content", {
                  error: error instanceof Error ? error.message : String(error),
                })
              : t("messages.content")
          }
        />
      )}
    >
      <Content components={components} />
    </ErrorBoundary>
  );
}
