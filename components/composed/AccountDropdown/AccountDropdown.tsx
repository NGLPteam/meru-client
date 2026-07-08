import { useTranslation } from "react-i18next";
import { useCallback, useTransition } from "react";
import useViewerContext from "@/contexts/useViewerContext";
import { Avatar, Dropdown, Link } from "@/components/atomic";
import NavMenuLink from "@/components/atomic/links/NavMenuLink";
import IconFactory from "@/components/factories/IconFactory";
import { useProgress } from "@/lib/vendor/react-transition-progress";
import { setClientToken } from "@/lib/api/clientToken";
import styles from "./AccountDropdown.module.css";
import PreviewModeButton from "./PreviewModeButton";
import { signIn, signOut } from "./actions";

export default function AccountDropdown({ condensed }: Props) {
  const { avatarUrl, name, isAuthenticated, canAccessAdmin, isPreview } =
    useViewerContext();

  const { t } = useTranslation();

  const startProgress = useProgress();

  const [, startTransition] = useTransition();

  const adminUrl = process.env.NEXT_PUBLIC_ADMIN_URL;

  const handleSignOut = useCallback(() => {
    startTransition(async () => {
      startProgress();
      setClientToken(undefined);
      await signOut();
    });
  }, [startProgress]);

  const menuItems = [
    ...(adminUrl && canAccessAdmin
      ? [<Dropdown.Link key={1} href={adminUrl} label={t("nav.admin")} />]
      : []),
    ...(!isPreview && canAccessAdmin
      ? [<PreviewModeButton key={3} label={t("preview.preview_mode")} />]
      : []),
    <Link as="button" type="button" key={2} onClick={handleSignOut}>
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
