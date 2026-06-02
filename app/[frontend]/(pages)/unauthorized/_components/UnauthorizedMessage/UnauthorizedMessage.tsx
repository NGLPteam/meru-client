"use client";

import { Trans, useTranslation } from "react-i18next";
import Button from "@/components/atomic/Button";

const messages = {
  unauthenticated: {
    heading: "messages.unauthorized",
    body: "messages.unauthorized_body",
  },
  forbidden: {
    heading: "messages.forbidden",
    body: "messages.forbidden_body",
  },
};

export default function UnauthorizedMessage({
  reason,
  entity,
}: {
  reason?: string;
  entity?: string;
}) {
  const { t } = useTranslation();

  const keys =
    reason && reason in messages
      ? messages[reason as keyof typeof messages]
      : messages.forbidden;

  const entityLabel = entity ? t(`glossary.${entity}`) : t("common.record");

  return (
    <div
      className="l-container-wide l-flex l-flex--align-center"
      style={{ minHeight: "40vh", justifyContent: "center" }}
    >
      <div className="t-rte t-align-center">
        <h2 className="t-h3">{t(keys.heading, { entity: entityLabel })}</h2>
        <Trans i18nKey={keys.body} values={{ entity: entityLabel }} />
        <Button size="sm" as="a" href="/">
          {t("nav.home")}
        </Button>
      </div>
    </div>
  );
}
