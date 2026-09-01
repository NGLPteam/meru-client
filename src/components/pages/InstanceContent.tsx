"use client";

// Hydrated because the hero embeds an interactive SearchHero.
import InstanceHero from "@/components/composed/instance/InstanceHero";
import InstanceCommunities from "@/components/composed/instance/InstanceCommunities";
import type { GlobalStaticData } from "@/contexts/GlobalStaticContext/GlobalStaticContext";
import AppProviders from "../providers/AppProviders";

type Props = {
  data: React.ComponentProps<typeof InstanceHero>["data"];
  communities: React.ComponentProps<typeof InstanceCommunities>["data"];
  globalData?: GlobalStaticData;
  route?: React.ComponentProps<typeof AppProviders>["route"];
  draftModeEnabled?: React.ComponentProps<
    typeof AppProviders
  >["draftModeEnabled"];
};

export default function InstanceContent({
  data,
  communities,
  globalData,
  route,
  draftModeEnabled,
}: Props) {
  return (
    <AppProviders
      globalData={globalData}
      route={route}
      draftModeEnabled={draftModeEnabled}
    >
      <InstanceHero data={data} />
      <InstanceCommunities data={communities} />
    </AppProviders>
  );
}
