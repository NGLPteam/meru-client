"use client";

// Standalone island: `import "@/i18n"` initializes the shared i18next singleton
// (idempotent) so react-i18next's `useTranslation` resolves against it without
// needing the full provider stack.
import "@/i18n";
import { useTransition } from "react";
import { useTranslation } from "react-i18next";
import classNames from "classnames";
import { actions } from "astro:actions";
import { Button } from "@/components/atomic";
import { useRouter } from "@/lib/routing/hooks";
import styles from "@/components/global/DraftModeBanner/DraftModeBanner.module.css";

export default function DraftModeBannerIsland() {
  const { t } = useTranslation();
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const handleExit = () => {
    startTransition(async () => {
      await actions.exitPreview();
      // Soft navigation (not a hard reload) so the ClientRouter loading bar
      // animates while the server re-renders with draft mode cleared.
      router.refresh();
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
