import { t } from "@/lib/i18n";
import NoContent from "@/components/layout/messages/NoContent";

export default function EmptyMessage({ entityType }: { entityType?: string }) {
  const headingKey =
    entityType === "item"
      ? "messages.empty_item_heading"
      : "messages.empty_heading";

  return (
    <NoContent
      message={
        <div className="t-rte t-h4">
          <h1 className="t-h3 font-medium">
            {t(headingKey, { entity: entityType ?? "entity" })}
          </h1>
          <p className="max-w-[850px]">{t("messages.empty_body")}</p>
          <p>{t("messages.empty_support")}</p>
        </div>
      }
    />
  );
}
