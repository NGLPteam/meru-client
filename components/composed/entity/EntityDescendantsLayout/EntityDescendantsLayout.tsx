"use client";

import {
  graphql,
  useFragment,
  type FragmentType,
  type DocumentType,
} from "@/lib/api/gql";
import { useTranslation } from "react-i18next";
import { getSchemaPluralName } from "@/helpers/translations";
import BrowseListLayout from "@/components/layout/BrowseListLayout";
import LoadingBlock from "@/components/atomic/loading/LoadingBlock";
import EntitySummary from "@/components/composed/entity/EntitySummary";
import type { ListEntityContext } from "@/types/graphql-schema";
import EntityDescendantOrderSelect from "../EntityDescendantOrderSelect";

interface Props {
  data: FragmentType<typeof fragment> | null;
  schema: string;
  showContext?: ListEntityContext;
}

export default function EntityDescendantsLayout({
  data,
  schema,
  showContext,
}: Props) {
  const { t } = useTranslation();
  const decendants = useFragment(fragment, data);
  const schemaName = decendants
    ? decendants.edges?.[0]?.node?.descendant?.schemaDefinition?.name || ""
    : "";

  return decendants ? (
    <BrowseListLayout
      data={decendants.pageInfo}
      header={getSchemaPluralName(schema, schemaName, t)}
      orderComponent={<EntityDescendantOrderSelect />}
      items={decendants.edges.map(({ node: { descendant } }) => (
        <EntitySummary
          key={descendant.slug}
          data={descendant}
          showContext={showContext}
          browseStyle
        />
      ))}
    />
  ) : (
    <LoadingBlock />
  );
}

const fragment = graphql(`
  fragment EntityDescendantsLayoutFragment on EntityDescendantConnection {
    edges {
      node {
        descendant {
          ... on Sluggable {
            slug
          }
          ... on Entity {
            schemaDefinition {
              identifier
              name
            }
            ...EntitySummaryFragment
          }
        }
      }
    }
    pageInfo {
      ...BrowseListLayoutFragment
    }
  }
`);
