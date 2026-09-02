import classNames from "classnames";
import { graphql, useFragment, type FragmentType } from "@/lib/api/gql";
import { templateSlotInlineFragment } from "@/components/templates/shared/shared.slots.graphql";
import HeroHeader from "../Header";
import HeroImage from "../Image";
import styles from "./patterns.module.css";

const mainRegex = /^\/communities\/[A-Za-z0-9]{30,32}$/;

const isMainPath = (pathname: string) =>
  mainRegex.test(pathname) || pathname.startsWith("/permalink");

export default function CommunityHeroHeader({
  data,
  pathname = "/",
}: {
  data?: FragmentType<typeof fragment> | null;
  // Rendered statically from an .astro shell, pathname arrives as a prop and
  // the SearchHero form is mounted by the shell as its own island.
  pathname?: string;
}) {
  const isMain = isMainPath(pathname);

  const layout = useFragment(fragment, data);

  const { template, entity } = layout ?? {};

  const { heroImageLayout } = entity ?? {};

  const { definition, slots } = template ?? {};

  const { showHeroImage } = definition ?? {};

  const hasTextContent =
    slots &&
    ((slots.header && !slots.header.empty) ||
      (slots.headerSummary && !slots.headerSummary.empty));

  const hasHeroImage = !!entity?.heroImage?.hero?.webp?.url;

  const bgClass = hasHeroImage
    ? showHeroImage && heroImageLayout === "ONE_COLUMN"
      ? "a-bg-neutral90"
      : "a-bg-custom20"
    : "a-bg-custom10";

  return isMain ? (
    <>
      {(hasTextContent || hasHeroImage) && (
        <section className={bgClass}>
          <div
            className={classNames(styles.grid, {
              [styles["grid--noImage"]]: !hasHeroImage,
            })}
          >
            {hasTextContent && (
              <HeroHeader data={template} layout={heroImageLayout} />
            )}
            {showHeroImage && hasHeroImage && (
              <HeroImage data={entity?.heroImage} layout={heroImageLayout} />
            )}
          </div>
        </section>
      )}
    </>
  ) : null;
}

// What the .astro shell should pass its SearchHero, or null when the hero
// renders none.
export function getSearchHeroProps(
  data: FragmentType<typeof fragment> | null | undefined,
  pathname: string,
) {
  const layout = useFragment(fragment, data);
  const { showBigSearchPrompt } = layout?.template?.definition ?? {};
  if (!isMainPath(pathname) || !showBigSearchPrompt) return null;
  const prompt = useFragment(
    templateSlotInlineFragment,
    layout?.template?.slots?.bigSearchPrompt,
  );
  return { prompt: prompt?.content ?? null };
}

const fragment = graphql(`
  fragment CommunityHeroHeaderFragment on HeroLayoutInstance {
    entity {
      ... on Community {
        heroImage {
          ...ImageHeroTemplateFragment
          hero {
            webp {
              url
            }
          }
        }
        heroImageLayout
      }
    }
    template {
      definition {
        showHeroImage
        showBigSearchPrompt
      }
      slots {
        bigSearchPrompt {
          ...sharedInlineSlotFragment
        }
        header {
          empty
        }
        headerSummary {
          empty
        }
      }
      ...HeaderHeroFragment
    }
  }
`);
