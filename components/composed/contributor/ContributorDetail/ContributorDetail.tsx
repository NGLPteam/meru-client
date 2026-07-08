"use client";

import { useMemo, useState } from "react";
import { useQuery } from "urql";
import { graphql, useFragment, type FragmentType } from "@/lib/api/gql";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useTranslation } from "react-i18next";
import classNames from "classnames";
import { ExternalLink, Markdown, ORCIDLink } from "@/components/atomic";
import BrowseListLayout from "@/components/layout/BrowseListLayout";
import ContributionSummary from "@/components/composed/contribution/ContributionSummary";
import ContributorName from "../ContributorName";
import ContributorAvatar from "../ContributorAvatar";
import styles from "./ContributorDetail.module.css";

export default function ContributorDetail({ data }: Props) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  // Initial (SSR) data from the fragment ref provides the id used to refetch.
  const base = useFragment(fragment, data);
  const id = base?.id;

  // Client-side pagination: null until the reader paginates, at which point we
  // refetch the contributor by id with the new page.
  const [page, setPage] = useState<number | null>(null);

  const [result] = useQuery({
    query: refetchQuery,
    variables: { id: id ?? "", page: page ?? 1 },
    pause: page === null || !id,
  });

  const refetched = useFragment(
    fragment,
    result.data?.node?.__typename ? result.data.node : null,
  );

  const contributor = page !== null && refetched ? refetched : base;
  const isPending = result.fetching;

  const onPageChange = (val: Record<string, string | number>) => {
    const pageNum = val.page
      ? typeof val.page === "string"
        ? parseInt(val.page)
        : val.page
      : null;
    if (!pageNum) return;

    const params = new URLSearchParams(searchParams);
    params.set("page", pageNum.toString());
    const url = `${pathname}?${params.toString()}`;
    window.scrollTo({ top: 0, behavior: "smooth" });
    router.push(url);

    setPage(pageNum);
  };

  const { t } = useTranslation();

  const attributions = contributor?.attributions;

  const hasAttributions = !!attributions?.pageInfo?.totalCount;

  const hasLinks = useMemo(
    () => contributor && contributor.links && contributor.links.length > 0,
    [contributor],
  );

  return contributor ? (
    <>
      <section className="a-bg-custom10">
        <div
          className={classNames("l-container-wide", styles.contributorWrapper)}
        >
          <header className={styles.name}>
            {contributor.image?.storage && (
              <ContributorAvatar data={contributor.image} />
            )}
            <h1 className="t-h3">
              <ContributorName data={contributor} />
            </h1>
          </header>
          {"title" in contributor && contributor.title && (
            <p className="t-label-lg">{contributor.title}</p>
          )}
          {"affiliation" in contributor && contributor.affiliation && (
            <p className="t-copy-lighter">{contributor.affiliation}</p>
          )}
          {contributor.bio && (
            <div className="t-copy-light t-rte">
              <Markdown.Base>{contributor.bio}</Markdown.Base>
            </div>
          )}
          {(hasLinks || contributor.orcid) && (
            <ul className="t-label-sm">
              {contributor.orcid && (
                <li className={styles.bioLink}>
                  <ORCIDLink href={contributor.orcid}>
                    {contributor.orcid}
                  </ORCIDLink>
                </li>
              )}
              {hasLinks &&
                contributor.links.map(({ title, url }, i) => (
                  <li className={styles.bioLink} key={i}>
                    <ExternalLink href={url}>{title}</ExternalLink>
                  </li>
                ))}
            </ul>
          )}
        </div>
      </section>
      {hasAttributions && (
        <BrowseListLayout
          data={attributions.pageInfo}
          header={t("layouts.contributions_header")}
          onPageChange={onPageChange}
          isPending={isPending}
          items={attributions.nodes.map((node) => (
            <ContributionSummary key={node.id} data={node} />
          ))}
        />
      )}
    </>
  ) : null;
}

interface Props {
  data?: FragmentType<typeof fragment> | null;
  backRoute?: string;
  backLabel?: string;
}

const fragment = graphql(`
  fragment ContributorDetailFragment on Contributor {
    ... on Node {
      id
    }
    ...ContributorNameFragment
    ... on Contributor {
      bio
      orcid
      attributions(page: $page, perPage: 25) {
        nodes {
          ... on ContributorItemAttribution {
            id
          }
          ... on ContributorCollectionAttribution {
            id
          }
          ...ContributionSummaryFragment
        }
        pageInfo {
          totalCount
          ...BrowseListLayoutFragment
        }
      }
      image {
        storage
        ...ContributorAvatarFragment
      }
      links {
        title
        url
      }
    }
    ... on PersonContributor {
      affiliation
      title
    }
  }
`);

const refetchQuery = graphql(`
  query ContributorDetailRefetchQuery($id: ID!, $page: Int) {
    node(id: $id) {
      __typename
      ...ContributorDetailFragment
    }
  }
`);
