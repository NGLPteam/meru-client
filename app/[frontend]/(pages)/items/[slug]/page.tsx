import { notFound } from "next/navigation";
import { graphql } from "@/lib/api/gql";
import MainLayout from "@/components/templates/MainLayout";
import queryApi from "@/lib/api/queryApi";
import { BasePageParams } from "@/types/page";
import { FullTextCheckRedirect } from "@/components/templates/FullTextCheck/FullTextCheck";

export async function generateStaticParams() {
  return [];
}

export default async function TemplatePage({ params }: BasePageParams) {
  const { slug } = await params;
  const { data } =
    (await queryApi(query, {
      slug,
    })) ?? {};

  const { item } = data ?? {};

  if (!item) return notFound();

  const { main } = item.layouts;

  return (
    <FullTextCheckRedirect redirectPath={`/items/${slug}/metadata`}>
      <MainLayout data={main} />
    </FullTextCheckRedirect>
  );
}

const query = graphql(`
  query pageItemTemplateQuery($slug: Slug!) {
    item(slug: $slug) {
      layouts {
        main {
          ...MainLayoutFragment
        }
      }
    }
  }
`);
