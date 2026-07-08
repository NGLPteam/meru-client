import { graphql } from "@/lib/api/gql";
import { redirect, notFound } from "next/navigation";
import InstanceCommunities from "@/components/composed/instance/InstanceCommunities";
import InstanceHero from "@/components/composed/instance/InstanceHero";
import queryApi from "@/lib/api/queryApi";
import SetCommunity from "@/components/global/SetCommunity";

export async function generateStaticParams() {
  return [];
}

export default async function HomePage() {
  const { data: instance } = await queryApi(query, {});

  const total = instance?.communities?.pageInfo?.totalCount ?? 0;
  const firstSlug = instance?.communities?.edges[0]?.node?.slug ?? null;

  if (total === 1 && firstSlug) {
    const href = `/communities/${firstSlug}`;
    redirect(href);
  }

  if (!instance) return notFound();

  return (
    <SetCommunity>
      <InstanceHero data={instance} />
      <InstanceCommunities data={instance.communities} />
    </SetCommunity>
  );
}

const query = graphql(`
  query pageInstanceContentLayoutQuery {
    communities(order: POSITION_ASCENDING) {
      edges {
        node {
          slug
        }
      }
      pageInfo {
        totalCount
      }
      ...InstanceCommunitiesFragment
    }
    ...InstanceHeroFragment
  }
`);
