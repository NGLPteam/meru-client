import classNames from "classnames";
import { t } from "@/lib/i18n";
import Link from "..";
import styles from "../Link.module.css";

type BaseProps = React.ComponentProps<typeof Link> & { className?: string };

/* Simple download text and icon,
 * style can be changed using the className property */
export default function DownloadLink({
  className = "t-label-lg",
  children,
  ...props
}: BaseProps) {
  return (
    <Link
      {...props}
      className={classNames(className, styles.download)}
      icon="download"
      download
    >
      {children || t("common.download")}
    </Link>
  );
}
