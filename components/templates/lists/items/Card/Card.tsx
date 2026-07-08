import classNames from "classnames";
import {
  useSharedListItemTemplateFragment,
  listItemTemplateFragment as sharedListItemTemplateFragment,
} from "@/components/templates/shared/shared.listItems.graphql";
import { type FragmentType } from "@/lib/api/gql";
import InlineSlotWrapper from "@/components/templates/mdx/InlineSlotWrapper";
import NamedLink from "@/components/atomic/links/NamedLink";
import { getRouteByEntityType } from "@/helpers/routes";
import { getThumbWithFallback } from "@/helpers";
import CoverImage from "./Cover";
import styles from "./Card.module.css";

export default function CardListItem({
  data,
}: {
  data?: FragmentType<typeof sharedListItemTemplateFragment> | null;
  hideCover?: boolean;
}) {
  const { slots, entity } = useSharedListItemTemplateFragment(data);

  const { header, subheader, contextFull, metaA, metaB } = slots ?? {};

  if (!(entity?.__typename === "Item" || entity?.__typename === "Collection"))
    return null;

  const href = `/${getRouteByEntityType(entity?.__typename)}/${entity.slug}`;

  const thumbnailData = getThumbWithFallback(entity);

  return (
    <li className={styles.item}>
      <NamedLink href={href}>
        <div className={styles.inner}>
          <div className={classNames("a-bg-neutral90", styles.coverWrapper)}>
            <div className={styles.coverInner}>
              <CoverImage
                title={entity.title}
                id={entity.id}
                data={thumbnailData.thumbnail}
              />
            </div>
          </div>
          <div className={styles.text}>
            <div className={styles.titleBlock}>
              {contextFull?.valid && !!contextFull.content && (
                <span className={styles.contextOne}>
                  <InlineSlotWrapper content={contextFull.content} />
                </span>
              )}
              {header?.valid && !!header.content && (
                <h4 className={classNames("line-clamp-2", styles.header)}>
                  <InlineSlotWrapper content={header.content} />
                </h4>
              )}
              {subheader?.valid && !!subheader.content && (
                <span className={styles.subheader}>
                  <InlineSlotWrapper content={subheader.content} />
                </span>
              )}
            </div>
            {(metaA?.valid || metaB?.valid) && (
              <div className={styles.group}>
                {metaA?.valid && !!metaA.content && (
                  <InlineSlotWrapper content={metaA.content} />
                )}
                {metaB?.valid && <InlineSlotWrapper content={metaB.content} />}
              </div>
            )}
          </div>
        </div>
      </NamedLink>
    </li>
  );
}
