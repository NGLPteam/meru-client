import { notFound } from "@/lib/routing/navigation";
import { graphql } from "@/lib/api/gql";
import MainLayout from "@/components/templates/MainLayout";
import queryApi from "@/lib/api/queryApi";
import { BasePageParams } from "@/types/page";

export async function generateStaticParams() {
  return [];
}

export default async function TemplatePage({ params }: BasePageParams) {
  const { slug } = await params;

  const { data } =
    (await queryApi(query, {
      slug,
    })) ?? {};

  const { community } = data ?? {};

  if (!community) return notFound();

  const { main } = community.layouts;

  return <MainLayout data={main} computedBgStart="NONE" />;
}

const query = graphql(`
  query pageTemplateQuery($slug: Slug!) {
    community(slug: $slug) {
      layouts {
        main {
          ...MainLayoutFragment
        }
      }
    }
  }
`);
