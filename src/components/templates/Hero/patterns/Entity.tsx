import { useTranslation } from "react-i18next";
import {
  graphql,
  useFragment,
  useFragment as readFragment,
  type FragmentType,
} from "@/lib/api/gql";
import Container from "@/components/layout/Container";
import BreadcrumbsBar from "@/components/layout/BreadcrumbsBar";
import { getBgClass } from "@/components/templates/helpers/bgColor";
import HeroDetail from "../Detail";
import HeroHeader from "../Header";
import HeroImage from "../Image";

export default function EntityHeroHeader({
  data,
  hideBreadcrumbsBar,
}: {
  data?: FragmentType<typeof fragment> | null;
  hideBreadcrumbsBar?: boolean;
}) {
  const { t } = useTranslation();

  const layout = useFragment(fragment, data);

  const { template, entity } = layout ?? {};

  const {
    showHeroImage,
    background,
    showBreadcrumbs,
    showSharingLink,
    showSplitDisplay,
  } = template?.definition ?? {};

  const visibility =
    entity && "visibility" in entity ? entity.visibility : undefined;
  const currentlyHidden =
    entity && "currentlyHidden" in entity ? entity.currentlyHidden : undefined;
  const schemaIdentifier =
    entity && "schemaDefinition" in entity
      ? entity.schemaDefinition?.identifier
      : undefined;
  const heroImage =
    entity && "heroImage" in entity ? entity.heroImage : undefined;

  const hidden = !!(visibility === "HIDDEN" || currentlyHidden);

  const hiddenAlert = hidden
    ? t("messages.hidden", {
        schema: schemaIdentifier?.replaceAll("_", " "),
      })
    : undefined;

  const renderBreadcrumbs = !!(showBreadcrumbs || showSharingLink);

  const bgClass = getBgClass(background);

  const renderHeroImage = showHeroImage && heroImage?.storage;

  return (
    <>
      {renderBreadcrumbs && !hideBreadcrumbsBar && (
        <BreadcrumbsBar
          data={entity}
          showShare={showSharingLink ?? false}
          className={bgClass}
        />
      )}
      <Container as="header" width="wide" bgColor={background} hideDivider>
        <HeroHeader data={layout?.template} hiddenAlert={hiddenAlert} />
      </Container>
      {showSplitDisplay && (
        <Container bgColor={background} hideDivider>
          <HeroDetail data={layout?.template} />
        </Container>
      )}
      {renderHeroImage && <HeroImage data={heroImage} />}
    </>
  );
}

// What an .astro shell should pass its BreadcrumbsBar island when it hoists
// the bar out of this statically-rendered hero (hideBreadcrumbsBar). See
// getHeroBreadcrumbProps in ../Hero.tsx.
export function getBreadcrumbsBarProps(
  data?: FragmentType<typeof fragment> | null,
) {
  const layout = readFragment(fragment, data);
  const { template, entity } = layout ?? {};
  const { background, showBreadcrumbs, showSharingLink } =
    template?.definition ?? {};
  if (!entity || (!showBreadcrumbs && !showSharingLink)) return null;
  return {
    data: entity,
    showShare: showSharingLink ?? false,
    className: getBgClass(background),
  };
}

const fragment = graphql(`
  fragment EntityHeroHeaderFragment on HeroLayoutInstance {
    entity {
      ... on Collection {
        __typename
        visibility
        currentlyHidden
        heroImage {
          storage
          ...ImageHeroTemplateFragment
        }
        schemaDefinition {
          identifier
        }
      }
      ... on Item {
        __typename
        visibility
        currentlyHidden
        heroImage {
          storage
          ...ImageHeroTemplateFragment
        }
        schemaDefinition {
          identifier
        }
      }
      ...BreadcrumbsBarFragment
    }
    template {
      definition {
        background
        showHeroImage
        showBreadcrumbs
        showSharingLink
        showSplitDisplay
      }
      ...HeaderHeroFragment
      ...DetailHeroFragment
    }
  }
`);
