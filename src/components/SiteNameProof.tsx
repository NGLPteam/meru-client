import { graphql, useFragment, type FragmentType } from "@/lib/api/gql";

// Phase 0 fragment-masking proof: a pure fragment-consuming React component,
// exactly the pattern every real Meru component follows. It receives a fragment
// ref as a prop and unmasks it with codegen's useFragment (a pure function that
// runs in server render and client hydration alike). Rendered server-side from
// an .astro page below.
export const siteNameProofFragment = graphql(`
  fragment SiteNameProof on GlobalConfiguration {
    site {
      installationName
    }
  }
`);
const fragment = siteNameProofFragment;

export default function SiteNameProof({
  data,
}: {
  data: FragmentType<typeof fragment>;
}) {
  const config = useFragment(fragment, data);
  return (
    <strong data-proof="site-name">{config.site?.installationName}</strong>
  );
}
