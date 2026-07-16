"use client";

import { Trans } from "react-i18next";
import NoContent from "@/components/layout/messages/NoContent";

export default function EmptyMessage({ entityType }: { entityType?: string }) {
  const i18nKey =
    entityType === "item" ? "messages.empty_item" : "messages.empty";
  const noContentMessage = (
    <div className="t-rte t-h4">
      <Trans
        i18nKey={i18nKey}
        values={{ entity: entityType ?? "entity" }}
        components={[
          // eslint-disable-next-line jsx-a11y/heading-has-content
          <h1 key="heading" className="t-h3 font-medium"></h1>,
          <p key="p1" className="max-w-[850px]"></p>,
          <p key="p2"></p>,
        ]}
      />
    </div>
  );

  return <NoContent message={noContentMessage} />;
}
