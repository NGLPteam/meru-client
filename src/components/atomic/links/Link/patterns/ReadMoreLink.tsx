import { t } from "@/lib/i18n";
import classNames from "classnames";
import { MaybeLinkRef } from "@castiron/common-types";
import Link from "../Link";
import styles from "../Link.module.css";

function ReadMoreLink({
  className,
  ref,
  ...props
}: {
  className?: string;
  ref?: MaybeLinkRef;
}) {
  return (
    <Link
      ref={ref}
      as="span"
      icon="arrowRight"
      className={classNames(styles.readMore, className)}
      {...props}
    >
      {t("common.read_more")}
    </Link>
  );
}

export default ReadMoreLink;
