import { useRef } from "react";
import { graphql, useFragment, type FragmentType } from "@/lib/api/gql";
import { BackToTopBlock } from "@/components/layout";
import ContentImage from "@/components/atomic/images/ContentImage";
import Container from "@/components/layout/Container";
import { useSharedBlockFragment } from "@/components/templates/shared/shared.slots.graphql";
import BlockSlotWrapper from "@/components/templates/mdx/BlockSlotWrapper";
import EmptyMessage from "@/components/templates/ProcessingCheck/EmptyMessage";
import type { HeroBackground } from "@/types/graphql-schema";
import TOC from "./TOC";
import styles from "./Full.module.css";

export default function FullVariant({
  data,
  bgColor,
}: {
  data?: FragmentType<typeof fragment> | null;
  bgColor?: HeroBackground | null;
}) {
  const template = useFragment(fragment, data);

  const { entity, slots, detailDefinition } = template ?? {};

  const body = useSharedBlockFragment(slots?.body);

  const textEl = useRef<HTMLDivElement>(null);

  if ((entity?.__typename as string | undefined) === "%other") return null;

  const { showHeroImage, showBody } = detailDefinition ?? {};

  if (typeof showBody === "boolean" && !showBody) return null;

  const isPDF = body?.content?.startsWith("<PDFViewer");

  return (
    <Container width="wide" bgColor={bgColor}>
      {isPDF ? (
        <div className={styles.outer}>
          {body?.valid && !!body.content ? (
            <BlockSlotWrapper content={body.content} />
          ) : (
            <EmptyMessage entityType={entity?.__typename.toLowerCase()} />
          )}
        </div>
      ) : (
        <BackToTopBlock className={styles.outer}>
          <div className={styles.inner}>
            <TOC textRef={textEl} />
            {body?.valid && !!body.content ? (
              <div className={styles.text} ref={textEl}>
                {showHeroImage && entity?.heroImage?.storage && (
                  <div className={styles.image}>
                    <ContentImage data={entity.heroImage} />
                  </div>
                )}
                <div className="t-rte">
                  <BlockSlotWrapper content={body.content} />
                </div>
              </div>
            ) : (
              <div className={styles.noContent}>
                <EmptyMessage entityType={entity?.__typename.toLowerCase()} />
              </div>
            )}
          </div>
        </BackToTopBlock>
      )}
    </Container>
  );
}

const fragment = graphql(`
  fragment FullDetailFragment on DetailTemplateInstance {
    entity {
      ... on Item {
        __typename
        heroImage {
          storage
          ...ContentImageFragment
        }
      }
      ... on Collection {
        __typename
        heroImage {
          storage
          ...ContentImageFragment
        }
      }
    }
    detailDefinition: definition {
      showBody
      showHeroImage
    }
    slots {
      header {
        ...sharedInlineSlotFragment
      }
      subheader {
        ...sharedInlineSlotFragment
      }
      body {
        ...sharedBlockSlotFragment
      }
    }
  }
`);
