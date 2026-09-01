import { graphql, useFragment, type FragmentType } from "@/lib/api/gql";
import { getRouteByEntityKind } from "@/helpers";
import NamedLink from "@/components/atomic/links/NamedLink";
import styles from "./Breadcrumbs.module.css";

interface Props {
  data: FragmentType<typeof fragment> | null;
}

export default function BreadcrumbLink({ data }: Props) {
  const crumb = useFragment(fragment, data);

  const route = getRouteByEntityKind(crumb?.kind);

  if (!crumb?.slug || !route) return null;

  return (
    <NamedLink href={`/${route}/${crumb.slug}`}>
      <span className={styles.text}>{crumb.label}</span>
    </NamedLink>
  );
}

const fragment = graphql(`
  fragment BreadcrumbLinkFragment on EntityBreadcrumb {
    label
    kind
    slug
  }
`);
