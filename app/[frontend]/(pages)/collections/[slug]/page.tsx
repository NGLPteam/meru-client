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

  const { data } = (await queryApi(query, { slug })) ?? {};

  const { collection } = data ?? {};

  if (!collection) return notFound();

  const { main } = collection.layouts;

  const computedBgStart =
    main?.templates?.[0]?.templateKind === "DETAIL" ? "LIGHT" : undefined;

  return <MainLayout data={main} computedBgStart={computedBgStart} />;
}

const query = graphql(`
  query pageCollectionTemplateQuery($slug: Slug!) {
    collection(slug: $slug) {
      layouts {
        main {
          ...MainLayoutFragment
          templates {
            ... on TemplateInstance {
              templateKind
            }
          }
        }
      }
    }
  }
`);
