import { graphql, useFragment, type FragmentType } from "@/lib/api/gql";
import SummaryListItem from "@/components/templates/lists/items/Summary";
import type { ListEntityContext } from "@/types/graphql-schema";

export default function EntitySummary({
  data,
  browseStyle,
  showContext = "FULL",
}: Props) {
  const entity = useFragment(fragment, data);

  return entity ? (
    <SummaryListItem
      data={entity.layouts.listItem?.template}
      showContext={showContext}
      browseStyle={browseStyle}
    />
  ) : null;
}

interface Props {
  data: FragmentType<typeof fragment> | null;
  browseStyle?: boolean;
  showContext?: ListEntityContext;
}

const fragment = graphql(`
  fragment EntitySummaryFragment on Entity {
    __typename
    layouts {
      listItem {
        template {
          ...sharedListItemTemplateFragment
        }
      }
    }
  }
`);
