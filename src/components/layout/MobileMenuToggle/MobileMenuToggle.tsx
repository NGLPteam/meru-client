import { type ComponentProps } from "react";
import classNames from "classnames";
import { t } from "@/lib/i18n";
import { MaybeButtonRef } from "@castiron/common-types";
import IconFactory from "@/components/factories/IconFactory";
import styles from "./MobileMenuToggle.module.css";

function MobileMenuToggle({
  className,
  ref,
  ...props
}: ComponentProps<"button"> & { ref?: MaybeButtonRef }) {
  return (
    <button
      className={classNames(styles.toggle, className)}
      ref={ref}
      {...props}
    >
      <span className={classNames("t-label-lg", styles.label)}>
        {t("nav.menu")}
      </span>
      <IconFactory icon="hamburger24" role="presentation" />
    </button>
  );
}

export default MobileMenuToggle;
