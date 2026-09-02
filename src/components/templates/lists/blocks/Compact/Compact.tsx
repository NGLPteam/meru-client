import {
  useSharedListTemplateFragment,
  listTemplateFragment as sharedListTemplateFragment,
} from "@/components/templates/shared/shared.list.graphql";
import { type FragmentType } from "@/lib/api/gql";
import Container from "@/components/layout/Container";
import InlineSlotWrapper from "@/components/templates/mdx/InlineSlotWrapper";
import type { HeroBackground } from "@/types/graphql-schema";
import List from "../../List";
import SeeAll from "../../SeeAll";
import { getSeeAllHref } from "../../SeeAll/helpers";
import styles from "./Compact.module.css";

export default function CompactListBlock({
  data,
  basePath,
  bgOverride,
}: {
  data?: FragmentType<typeof sharedListTemplateFragment> | null;
  basePath?: string | null;
  slug?: string;
  bgOverride?: HeroBackground | null;
}) {
  const {
    linksDefinition,
    descendantsDefinition,
    entityList,
    slots,
    seeAllOrdering,
  } = useSharedListTemplateFragment(data);

  const { empty, listItemLayouts } = entityList ?? {};

  if (empty) return null;

  const {
    background,
    seeAllOrderingIdentifier,
    seeAllButtonLabel,
    width,
    selectionLimit,
  } = linksDefinition ?? descendantsDefinition ?? {};

  const seeAllHref = descendantsDefinition
    ? getSeeAllHref(
        basePath,
        seeAllOrderingIdentifier as string | null | undefined,
        undefined,
      )
    : null;

  const renderSeeAll =
    !!seeAllOrderingIdentifier && !!seeAllHref
      ? seeAllOrdering?.count && selectionLimit
        ? seeAllOrdering.count > selectionLimit
        : true
      : false;

  const { blockHeader } = slots ?? {};

  return (
    <Container
      className={styles.container}
      bgColor={bgOverride ?? background}
      halfWidthTemplate={width === "HALF"}
    >
      <div className={styles.grid}>
        <div className={styles.textColumn}>
          {blockHeader?.valid && !!blockHeader?.content && (
            <h3 className={styles.header}>
              <InlineSlotWrapper content={blockHeader.content} />
            </h3>
          )}
          <List
            variant="COMPACT"
            bgColor={bgOverride ?? background}
            items={listItemLayouts}
          />
        </div>
        {/*
          Need to identify which image to use here
          {showHeroImage && <div className={styles.heroImage} />}
          */}
        {!!renderSeeAll && !!seeAllHref && (
          <SeeAll
            alignment="left"
            buttonLabel={seeAllButtonLabel}
            href={seeAllHref}
            className={styles.seeAll}
          />
        )}
      </div>
    </Container>
  );
}
