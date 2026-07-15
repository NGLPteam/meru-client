"use client";

// Sticky "you're in draft/preview mode" banner. Rendered by BaseLayout whenever
// the draft cookie is set (global toggle). Astro port of the Next
// DraftModeBanner — reuses its CSS; "exit" calls the exitPreview Action and
// reloads so the next SSR render drops draft mode.
//
// Standalone island: `import "@/i18n"` initializes the shared i18next singleton
// (idempotent) so react-i18next's `useTranslation` resolves against it without
// needing the chrome provider stack.
import "@/i18n";
import { useTransition } from "react";
import { useTranslation } from "react-i18next";
import classNames from "classnames";
import { actions } from "astro:actions";
import { Button } from "@/components/atomic";
import styles from "@/components/global/DraftModeBanner/DraftModeBanner.module.css";

export default function DraftModeBannerIsland() {
  const { t } = useTranslation();
  const [pending, startTransition] = useTransition();

  const handleExit = () => {
    startTransition(async () => {
      await actions.exitPreview();
      window.location.reload();
    });
  };

  return (
    <div
      className={classNames("a-bg-neutral80", styles.banner)}
      role="status"
      aria-live="polite"
    >
      <div className={styles.content}>
        <span className="t-copy-sm">{t("preview.draft_mode_message")}</span>
        <Button
          className={styles.exit}
          size="sm"
          secondary
          icon="close"
          onClick={handleExit}
          disabled={pending}
        >
          {t("preview.exit_draft_mode")}
        </Button>
      </div>
    </div>
  );
}
