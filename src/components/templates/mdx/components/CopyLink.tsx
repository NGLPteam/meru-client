import { useTranslation } from "react-i18next";
import Button from "@/components/atomic/Button";
import styles from "./components.module.css";
import type { PropsWithChildren } from "react";

type Props = PropsWithChildren & {
  label?: string | null;
};

// Static markup only; the <copy-link> custom element (src/components/client/CopyLink.astro)
// copies the rendered value's text to the clipboard on click.
export default function CopyLink({ children, label }: Props) {
  const { t } = useTranslation();

  return children ? (
    <copy-link className={styles.copyLink}>
      <p data-copy-source>{children}</p>
      <Button icon="copy" iconLeft secondary size="sm" data-copy-button>
        {label ? `${t("actions.copy")} ${label}` : t("actions.copy")}
      </Button>
    </copy-link>
  ) : null;
}
