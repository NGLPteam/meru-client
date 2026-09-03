"use client";

import classNames from "classnames";
import { t } from "@/lib/i18n";
import { graphql, useFragment, type FragmentType } from "@/lib/api/gql";
import { BackButton, NamedLink } from "@/components/atomic";
import styles from "./ContributorDetailNav.module.css";

export default function ContributorDetailNav({ data }: Props) {
  const entity = useFragment(fragment, data);
  const route =
    entity?.__typename === "Item"
      ? "items"
      : entity?.__typename === "Collection"
        ? "collections"
        : null;

  return entity && entity.slug && route ? (
    <nav className="a-bg-custom10">
      <div className={classNames(styles.inner, "l-container-wide")}>
        <NamedLink href={`/${route}/${entity.slug}`}>
          <BackButton as="div">
            {t("common.back_to_name", { name: entity.title })}
          </BackButton>
        </NamedLink>
      </div>
    </nav>
  ) : null;
}

interface Props {
  data?: FragmentType<typeof fragment> | null;
}

const fragment = graphql(`
  fragment ContributorDetailNavFragment on Entity {
    __typename

    ... on Entity {
      title
    }

    ... on Sluggable {
      slug
    }
  }
`);
