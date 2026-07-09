"use client";

import { useTransition } from "react";
import { useRouter } from "@/lib/routing/hooks";
import { useTranslation } from "react-i18next";
import classNames from "classnames";
import { Button } from "@/components/atomic";
import { useProgress } from "@/lib/vendor/react-transition-progress";
import { exitDraftMode } from "./actions";
import styles from "./DraftModeBanner.module.css";

export default function DraftModeBanner() {
  const { t } = useTranslation();
  const router = useRouter();
  const startProgress = useProgress();
  const [pending, startTransition] = useTransition();

  const handleExit = () => {
    startTransition(async () => {
      startProgress();
      await exitDraftMode();
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
