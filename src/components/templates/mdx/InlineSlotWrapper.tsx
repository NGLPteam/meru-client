"use client";

// Inline counterpart of BlockSlotWrapper (see its header comment): synchronous
// compile, no remark-gfm (parity with the previous serialize() call), and a
// p→span override since inline slots render inside heading/span elements.
import { t } from "@/lib/i18n";
import { evaluateSync } from "@mdx-js/mdx";
import * as runtime from "react/jsx-runtime";
import { renderToStaticMarkup } from "react-dom/server";
import { ErrorBoundary } from "react-error-boundary";
import useViewerContext from "@/contexts/useViewerContext";
import NoContent from "@/components/layout/messages/NoContent";
import { inlineSlotComponents } from "./components";
import { createElement, type PropsWithChildren } from "react";
import type { MDXComponents } from "mdx/types";

const overrides = {
  p: (props: PropsWithChildren) => <span {...props}>{props.children}</span>,
};

const components = { ...inlineSlotComponents, ...overrides } as MDXComponents;

export default function InlineSlotWrapper({
  content,
}: {
  content?: string | null;
}) {
  const { allowedActions } = useViewerContext();

  const isAdmin = allowedActions?.includes("admin.access");

  if (!content) return null;

  let Content;
  try {
    Content = evaluateSync(content, { ...runtime }).default;
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
