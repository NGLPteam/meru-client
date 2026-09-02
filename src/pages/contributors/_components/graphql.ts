import { graphql } from "@/lib/api/gql";

// Contributor detail (/contributors/[slug]). One of three documents is chosen at
// request time depending on whether the URL scopes the contributor to an item or
// a collection (for the breadcrumb nav + header community context).
export const contributorDetailQuery = graphql(`
  query contributorDetailQuery($slug: Slug!, $page: Int) {
    contributor(slug: $slug) {
      ...ContributorDetailFragment
    }
  }
`);

export const contributorItemQuery = graphql(`
  query contributorItemQuery($slug: Slug!, $item: Slug!, $page: Int) {
    contributor(slug: $slug) {
      ...ContributorDetailFragment
    }
    item(slug: $item) {
      ...ContributorDetailNavFragment
      community {
        ...ActiveCommunityFragment
      }
    }
  }
`);

export const contributorCollectionQuery = graphql(`
  query contributorCollectionQuery(
    $slug: Slug!
    $collection: Slug!
    $page: Int
  ) {
    contributor(slug: $slug) {
      ...ContributorDetailFragment
    }
    collection(slug: $collection) {
      ...ContributorDetailNavFragment
      community {
        ...ActiveCommunityFragment
      }
    }
  }
`);
