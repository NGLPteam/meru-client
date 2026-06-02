import { useTranslation } from "react-i18next";
import { useCallback } from "react";
import useViewerContext from "@/contexts/useViewerContext";
import { Avatar, Dropdown, Link } from "@/components/atomic";
import NavMenuLink from "@/components/atomic/links/NavMenuLink";
import IconFactory from "@/components/factories/IconFactory";
import { removeToken } from "@/lib/auth/token";
import styles from "./AccountDropdown.module.css";
import PreviewModeButton from "./PreviewModeButton";
import { signIn, signOut } from "./actions";

const PREVIEW_ROLES = ["ADMIN", "EDITOR", "MANAGER", "AUTHOR"];

export default function AccountDropdown({ condensed }: Props) {
  const { avatarUrl, name, isAuthenticated, primaryRole, isPreview } =
    useViewerContext();

  const { t } = useTranslation();

  const adminUrl = process.env.NEXT_PUBLIC_ADMIN_URL;

  const handleSignOut = useCallback(() => {
    removeToken();
    signOut();
  }, []);

  const canPreview = !!primaryRole && PREVIEW_ROLES.includes(primaryRole);

  const menuItems = [
    ...(adminUrl
      ? [<Dropdown.Link key={1} href={adminUrl} label={t("nav.admin")} />]
      : []),
    ...(!isPreview && canPreview
      ? [<PreviewModeButton key={3} label={t("preview.preview_mode")} />]
      : []),
    <Link as="button" key={2} onClick={handleSignOut}>
      {t("common.sign_out")}
    </Link>,
  ];

  return (
    <div className={styles.wrapper}>
      {isAuthenticated ? (
        <Dropdown
          disclosure={
            <div className={styles.disclosure}>
              <Avatar url={avatarUrl} />
              {name && (
                <span className={styles.name} data-condensed={condensed}>
                  {name}
                </span>
              )}
              <IconFactory className={styles.icon} icon="chevronDown" />
            </div>
          }
          label={t("nav.account")}
          menuItems={menuItems}
        />
      ) : (
        <NavMenuLink as="button" className="t-label-lg" onClick={signIn}>
          {t("common.sign_in")}
        </NavMenuLink>
      )}
    </div>
  );
}

interface Props {
  condensed?: boolean;
  mobile?: boolean;
}
