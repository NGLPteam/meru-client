"use client";

import { PropsWithChildren } from "react";
import { graphql, useFragment, type FragmentType } from "@/lib/api/gql";
import Container from "@/components/layout/Container";
import EmptyMessage from "./EmptyMessage";
import styles from "./ProcessingCheck.module.css";

type Props = PropsWithChildren & {
  data?: FragmentType<typeof fragment> | null;
  entityType: "item" | "collection" | "community";
};

export default function ProcessingCheck({ data, children, entityType }: Props) {
  const { main } = useFragment(fragment, data) ?? {};

  const { allHidden, templates } = main ?? {};

  return allHidden || !templates?.length ? (
    <Container className={styles.container}>
      <EmptyMessage entityType={entityType} />
    </Container>
  ) : (
    children
  );
}

const fragment = graphql(`
  fragment ProcessingCheckFragment on EntityLayouts {
    main {
      allHidden
      templates {
        ... on TemplateInstance {
          __typename
        }
      }
    }
  }
`);
