"use client";

// The footer's per-viewer "Explore" nav: Home (always) + Admin (canAccessAdmin) +
// Sign in (anonymous). Consumes ViewerContext, so it renders only inside the
// FooterNav `server:defer` island (real viewer) or as its anonymous fallback (no
// viewer → Home + Sign in). Lifted verbatim from the former AppFooter.tsx.
import { useTranslation } from "react-i18next";
import startCase from "lodash/startCase";
import classNames from "classnames";
import { NamedLink } from "@/components/atomic";
import useViewerContext from "@/contexts/useViewerContext";
import { ADMIN_URL } from "@/lib/env/clientConfig";
import { signIn } from "@/components/composed/AccountDropdown/actions";
import styles from "./AppFooter.module.css";

export default function FooterNavContent() {
  const { t } = useTranslation();
  const { isAuthenticated, canAccessAdmin } = useViewerContext();

  function renderRoute(href: string, label: string) {
    return (
      <li
        key={href}
        className={classNames("t-copy-sm t-copy-light", styles.navItem)}
      >
        <NamedLink href={href}>
          <span>{startCase(t(label))}</span>
        </NamedLink>
      </li>
    );
  }

  return (
    <nav className={styles.nav}>
      <h5 className="t-label-lg">{t("nav.explore")}</h5>
      <ul className={classNames("t-unstyled-list", styles.navList)}>
        {renderRoute("/", "nav.home")}
        {canAccessAdmin && ADMIN_URL && renderRoute(ADMIN_URL, "nav.admin")}
        {!isAuthenticated && (
          <li className={classNames("t-copy-sm t-copy-light", styles.navItem)}>
            <button
              onClick={(e) => {
                e.preventDefault();
                signIn();
              }}
            >
              {t("common.sign_in")}
            </button>
          </li>
        )}
      </ul>
    </nav>
  );
}
