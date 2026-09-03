import { PropsWithChildren } from "react";
import { t } from "@/lib/i18n";
import Link from "..";

type BaseProps = Omit<React.ComponentProps<typeof Link>, "children">;

/* Simple download text and icon,
 * style can be changed using the className property */
export default function ExternalLink({
  children,
  ...props
}: BaseProps & PropsWithChildren) {
  return children ? (
    <Link {...props} target="_blank" rel="noreferrer" icon="linkExternal">
      {children}
      <span className="sr-only">{t("common.opens_new_window")}</span>
    </Link>
  ) : null;
}
