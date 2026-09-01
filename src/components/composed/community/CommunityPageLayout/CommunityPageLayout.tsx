"use client";

import classNames from "classnames";
import { graphql, useFragment, type FragmentType } from "@/lib/api/gql";
import { Markdown } from "@/components/atomic";
import Container from "@/components/layout/Container";
import { generateSrcSet, sizes } from "@/helpers/generateSrcSet";
import styles from "./CommunityPageLayout.module.css";

export default function CommunityPageLayout({ data }: Props) {
  const page = useFragment(fragment, data);

  const hero = page?.heroImage?.hero?.webp;

  return page ? (
    <section className="a-bg-custom10">
      {hero?.url && (
        <figure className={classNames("a-bg-custom20", styles.imageWrapper)}>
          <img
            alt={hero.alt ?? ""}
            src={hero.url}
            srcSet={generateSrcSet(page.heroImage)}
            sizes={sizes}
            className={styles.heroImage}
            height={hero?.height ?? 300}
            width={hero?.width ?? 1200}
            decoding="async"
            loading="eager"
          />
        </figure>
      )}
      <Container as="div">
        <div className={classNames("t-rte", styles.content)}>
          <h2>{page.title}</h2>
          <Markdown.Page>{page.body}</Markdown.Page>
        </div>
      </Container>
    </section>
  ) : null;
}

interface Props {
  data?: FragmentType<typeof fragment> | null;
}

const fragment = graphql(`
  fragment CommunityPageLayoutFragment on Page {
    title
    body
    heroImage {
      hero {
        webp {
          url
          alt
          height
          width
        }
      }
      large {
        webp {
          url
          width
        }
      }
      medium {
        webp {
          url
          width
        }
      }
      small {
        webp {
          url
          width
        }
      }
    }
  }
`);
