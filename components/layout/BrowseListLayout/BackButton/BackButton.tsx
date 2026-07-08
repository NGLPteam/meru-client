import { useTranslation } from "react-i18next";
import { graphql, useFragment, type FragmentType } from "@/lib/api/gql";
import { getRouteByEntityType } from "@/helpers";
import { NamedLink, Button } from "@/components/atomic";
import styles from "./BackButton.module.css";

export default function BackButton({
  data,
}: {
  data: FragmentType<typeof fragment>;
}) {
  const { t } = useTranslation();

  const entity = useFragment(fragment, data);

  const schemaName = entity?.schemaVersion?.name;
  const backSchemaLabel = schemaName
    .replace("Journal ", "")
    .replace("Default ", "");

  const route = getRouteByEntityType(entity.__typename);

  return entity?.slug ? (
    <NamedLink href={`/${route}/${entity?.slug}`} className={styles.button}>
      <Button size="sm" secondary icon="arrowLeft" iconLeft as="div">
        {t("nav.back_to_entity", { schema: backSchemaLabel })}
      </Button>
    </NamedLink>
  ) : null;
}

const fragment = graphql(`
  fragment BackButtonFragment on Entity {
    __typename
    slug
    schemaVersion {
      name
    }
  }
`);
