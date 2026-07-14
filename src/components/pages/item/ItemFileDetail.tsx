"use client";

// Hydrated island: a single item file detail (/items/[slug]/files/[file]). The
// shell comes from the item; the content is a separately-queried asset.
import AssetDetailBlock from "@/components/composed/asset/AssetDetailBlock";
import type { DocumentType } from "@/lib/api/gql";
import type { GlobalStaticData } from "@/contexts/GlobalStaticContext/GlobalStaticContext";
import AppProviders from "../../providers/AppProviders";
import ItemShell from "./ItemShell";
import type { itemFileDetailQuery } from "../../../lib/queries/item";

type Data = DocumentType<typeof itemFileDetailQuery>;
type Item = NonNullable<Data["item"]>;
type Asset = NonNullable<Data["asset"]>;

type Props = {
  item: Item;
  asset: Asset;
  slug: string;
  globalData?: GlobalStaticData;
  route?: React.ComponentProps<typeof AppProviders>["route"];
};

export default function ItemFileDetail({
  item,
  asset,
  slug,
  globalData,
  route,
}: Props) {
  return (
    <AppProviders
      community={item.community}
      globalData={globalData}
      route={route}
    >
      <ItemShell data={item} slug={slug}>
        <AssetDetailBlock data={asset} />
      </ItemShell>
    </AppProviders>
  );
}
