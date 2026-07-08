import {
  useSharedListItemTemplateFragment,
  listItemTemplateFragment as sharedListItemTemplateFragment,
} from "@/components/templates/shared/shared.listItems.graphql";
import { type FragmentType } from "@/lib/api/gql";
import InlineSlotWrapper from "@/components/templates/mdx/InlineSlotWrapper";
import NamedLink from "@/components/atomic/links/NamedLink";
import IconFactory from "@/components/factories/IconFactory";
import { getRouteByEntityType } from "@/helpers/routes";
import styles from "./Compact.module.css";

export default function CompactListItem({
  data,
}: {
  data?: FragmentType<typeof sharedListItemTemplateFragment> | null;
  hideCover?: boolean;
}) {
  const { slots, entity } = useSharedListItemTemplateFragment(data);

  const { header, contextFull } = slots ?? {};

  const href =
    entity?.__typename === "Item" || entity?.__typename === "Collection"
      ? `/${getRouteByEntityType(entity?.__typename)}/${entity.slug}`
      : null;

  return (
    <li className={styles.item}>
      <NamedLink href={href}>
        <IconFactory icon="arrowRight" role="presentation" />
        {header?.valid && !!header.content && (
          <InlineSlotWrapper content={header.content} />
        )}
        {contextFull?.valid && !!contextFull.content && (
          <span className={styles.contextOne}>
            <InlineSlotWrapper content={contextFull.content} />
          </span>
        )}
      </NamedLink>
    </li>
  );
}
