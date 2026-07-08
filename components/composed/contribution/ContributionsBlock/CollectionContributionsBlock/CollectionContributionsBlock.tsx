"use client";

import { graphql, useFragment, type FragmentType } from "@/lib/api/gql";
import Contributor from "@/components/templates/Contributors/Contributor";
import BackButton from "@/components/layout/BrowseListLayout/BackButton";
import Container from "@/components/layout/Container";
import BaseContributionsBlock from "../BaseContributionsBlock";
import styles from "./CollectionContributionsBlock.module.css";

type BaseProps = Omit<
  React.ComponentProps<typeof BaseContributionsBlock>,
  "children"
> & { slug: string };

const ContributionsBlock = ({
  data,
  filterRole,
  slug,
  ...baseProps
}: Props) => {
  const collection = useFragment(fragment, data);

  const { attributions } = collection ?? {};

  const filtered = attributions?.filter(
    (node) =>
      !filterRole ||
      (!!node.roles.length &&
        node.roles.find(
          (r) => r.label.toLowerCase() === filterRole.toLowerCase(),
        )),
  );

  const backParams = new URLSearchParams({ item: slug });

  return (
    <Container width="wide" bgColor="NONE" className={styles.container}>
      {collection && <BackButton data={collection} />}
      <BaseContributionsBlock {...baseProps} innerClassName={styles.inner}>
        {filtered?.length
          ? filtered.map((node) => (
              <Contributor
                data={node}
                key={node.slug}
                backParams={backParams}
              />
            ))
          : null}
      </BaseContributionsBlock>
    </Container>
  );
};

interface Props extends BaseProps {
  data?: FragmentType<typeof fragment> | null;
  /** Filter by a role, example: author */
  filterRole?: string;
}

export default ContributionsBlock;

const fragment = graphql(`
  fragment CollectionContributionsBlockFragment on Collection {
    ...BackButtonFragment

    attributions {
      slug
      roles {
        label
      }
      contributor {
        image {
          storage
        }
      }
      ...ContributorFragment
    }
  }
`);
