import classNames from "classnames";
import { t } from "@/lib/i18n";
import IconFactory from "@/components/factories/IconFactory";
import styles from "./CloseModalButton.module.css";

export default function MobileMenuToggle({
  className,
  ...props
}: React.HTMLAttributes<HTMLButtonElement>) {
  return (
    <button className={classNames(styles.toggle, className)} {...props}>
      <span className={classNames("t-label-lg", styles.label)}>
        {t("common.close")}
      </span>
      <IconFactory icon="close24" role="presentation" />
    </button>
  );
}
