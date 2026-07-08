import { graphql, useFragment, type FragmentType } from "@/lib/api/gql";
import { useTranslation } from "react-i18next";
import capitalize from "lodash/capitalize";
import { useSharedInlineFragment } from "@/components/templates/shared/shared.slots.graphql";
import InlineSlotWrapper from "@/components/templates/mdx/BlockSlotWrapper";
import Container from "@/components/layout/Container";
import type { HeroBackground } from "@/types/graphql-schema";
import SeeAll from "@/components/templates/lists/SeeAll";
import Contributor from "./Contributor";
import styles from "./Contributors.module.css";

export default function ContributorsTemplate({
  data,
}: {
  data?: FragmentType<typeof fragment> | null;
  bgOverride?: HeroBackground | null;
}) {
  const { t } = useTranslation();

  const template = useFragment(fragment, data);

  const { entity, contributorsDefinition, slots } = template ?? {};

  const { background, width, limit } = contributorsDefinition ?? {};

  const header = useSharedInlineFragment(slots?.header);

  if (!template || !entity) return null;

  const mdxHeader = header?.valid && !!header.content;

  const attributions =
    (entity.__typename as string) !== "%other" ? entity.attributions : [];

  const shouldRender = !!attributions?.length;

  const renderedContributors = limit
    ? attributions?.slice(0, limit)
    : attributions;

  const showSeeAll =
    limit && attributions?.length > limit && entity.__typename === "Collection";

  const backParams =
    (entity.__typename as string) !== "%other"
      ? new URLSearchParams({
          ...(entity?.slug && {
            [entity.__typename.toLowerCase()]: entity.slug,
          }),
        })
      : new URLSearchParams();

  return shouldRender ? (
    <Container
      className={styles.container}
      bgColor={background}
      halfWidthTemplate={width === "HALF"}
    >
      <h3 className={styles?.testClass}>
        {mdxHeader ? (
          <InlineSlotWrapper content={header.content} />
        ) : (
          capitalize(t("glossary.contributor_other"))
        )}
      </h3>
      <ul className={styles.list}>
        {renderedContributors?.map((c, i) => (
          <Contributor key={i} data={c} backParams={backParams} />
        ))}
      </ul>
      {showSeeAll && (
        <SeeAll
          alignment="left"
          size="sm"
          icon="linkExternal"
          href={`/collections/${entity.slug}/contributors`}
          className={styles.seeAll}
        />
      )}
    </Container>
  ) : null;
}

const fragment = graphql(`
  fragment ContributorsTemplateFragment on ContributorListTemplateInstance {
    __typename
    entity {
      ... on Item {
        __typename
        slug
        attributions {
          ...ContributorFragment
        }
      }
      ... on Collection {
        __typename
        slug
        attributions {
          ...ContributorFragment
        }
      }
    }
    contributorsDefinition: definition {
      background
      limit
      width
    }
    slots {
      header {
        ...sharedInlineSlotFragment
      }
    }
  }
`);
