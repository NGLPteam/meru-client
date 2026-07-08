import { PropsWithChildren } from "react";
import { graphql } from "@/lib/api/gql";
import { notFound } from "next/navigation";
import { draftMode } from "next/headers";
import { ResolvingMetadata, Metadata } from "next";
import UnauthorizedMessage from "@/app/[frontend]/(pages)/unauthorized/_components/UnauthorizedMessage";
import GoogleScholarMetaTags from "@/components/global/GoogleScholarMetaTags";
import getStaticGoogleScholarData from "@/contexts/GlobalStaticContext/getStaticGoogleScholarData";
import HeroTemplate from "@/components/templates/Hero";
import ProcessingCheck from "@/components/templates/ProcessingCheck";
import FullTextCheck from "@/components/templates/FullTextCheck";
import NavigationTemplate from "@/components/templates/EntityNavigation";
import { BasePageParams } from "@/types/page";
import queryApi from "@/lib/api/queryApi";
import ViewCounter from "@/components/composed/analytics/ViewCounter";
import EntityNavBar from "@/components/composed/entity/EntityNavBar";
import generateItemMetadata from "@/app/[frontend]/(pages)/items/[slug]/_metadata/item";
import SetCommunity from "@/components/global/SetCommunity";

export async function generateMetadata(
  props: BasePageParams,
  parent: ResolvingMetadata,
): Promise<Metadata> {
  return generateItemMetadata(props, parent);
}

export default async function ItemLayout({
  children,
  params,
}: BasePageParams & PropsWithChildren) {
  const { slug } = await params;
  const { data } = await queryApi(query, { slug });

  const googleScholarData = await getStaticGoogleScholarData(slug);

  const { item } = data ?? {};

  if (!item) return notFound();

  const { isEnabled: draftModeEnabled } = await draftMode();

  if (draftModeEnabled && !item.canPreview?.value) {
    return <UnauthorizedMessage reason="forbidden" entity="item" />;
  }

  const { community, layouts } = item;

  const { hero, navigation } = layouts ?? {};

  return (
    <SetCommunity data={community}>
      {hero && <HeroTemplate data={hero} />}
      <ProcessingCheck data={layouts} entityType="item">
        {googleScholarData && (
          <GoogleScholarMetaTags entity={googleScholarData} />
        )}
        {slug && <ViewCounter slug={slug} />}
        <EntityNavBar data={item} />
        <FullTextCheck data={layouts}>
          <NavigationTemplate data={navigation} />
          {children}
        </FullTextCheck>
      </ProcessingCheck>
    </SetCommunity>
  );
}

const query = graphql(`
  query layoutItemTemplateQuery($slug: Slug!) {
    item(slug: $slug) {
      canPreview {
        value
      }
      layouts {
        hero {
          ...HeroTemplateFragment
        }
        navigation {
          ...EntityNavigationTemplateFragment
        }
        ...ProcessingCheckFragment
        ...FullTextCheckFragment
      }
      ...SearchButtonFragment
      ...EntityNavBarFragment

      community {
        ...SetCommunityFragment
      }
    }
  }
`);
