import { useTranslation } from "react-i18next";
import { NamedLink, Button } from "@/components/atomic";
import { fragment as EntityNavListFragment } from "@/components/composed/entity/EntityNavBar/EntityNavList/EntityNavList";
import { type DocumentType } from "@/lib/api/gql";

type Ordering = DocumentType<typeof EntityNavListFragment>["orderings"]["nodes"][number];

export default function BrowseButton({
  basePath,
  ordering,
}: {
  basePath: string;
  ordering: Ordering;
}) {
  const { t } = useTranslation();

  return (
    <li className="t-capitalize">
      <NamedLink href={`${basePath}/browse/${ordering.identifier}`}>
        <Button size="sm" secondary>
          {t("nav.browse_schema", { schema: ordering.name })}
        </Button>
      </NamedLink>
    </li>
  );
}
