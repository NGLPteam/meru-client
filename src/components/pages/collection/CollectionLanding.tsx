"use client";

// Hydrated island: the collection landing body — the collection shell wrapping
// the main layout. The parent community is threaded through AppProviders for the
// header context.
import MainLayout from "@/components/templates/MainLayout";
import type { DocumentType } from "@/lib/api/gql";
import type { GlobalStaticData } from "@/contexts/GlobalStaticContext/GlobalStaticContext";
import AppProviders from "../../providers/AppProviders";
import CollectionShell from "./CollectionShell";
import type { collectionQuery } from "../../../lib/queries/collection";

type Collection = NonNullable<
  DocumentType<typeof collectionQuery>["collection"]
>;

type Props = {
  collection: Collection;
  slug: string;
  globalData?: GlobalStaticData;
  route?: React.ComponentProps<typeof AppProviders>["route"];
  viewer?: React.ComponentProps<typeof AppProviders>["viewer"];
  draftModeEnabled?: React.ComponentProps<
    typeof AppProviders
  >["draftModeEnabled"];
};

export default function CollectionLanding({
  collection,
  slug,
  globalData,
  route,
  viewer,
  draftModeEnabled,
}: Props) {
  const main = collection.layouts.main;
  const firstKind = main?.templates?.[0];
  const computedBgStart =
    firstKind &&
    "templateKind" in firstKind &&
    firstKind.templateKind === "DETAIL"
      ? "LIGHT"
      : undefined;

  return (
    <AppProviders
      community={collection.community}
      globalData={globalData}
      route={route}
      viewer={viewer}
      draftModeEnabled={draftModeEnabled}
    >
      <CollectionShell data={collection} slug={slug}>
        <MainLayout data={main} computedBgStart={computedBgStart} />
      </CollectionShell>
    </AppProviders>
  );
}
