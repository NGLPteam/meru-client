"use client";

// Hydrated island: the home/instance page body (hero + community list). Wraps
// the unchanged Meru InstanceHero / InstanceCommunities in the app provider
// stack (own React root, separate from the chrome islands), fed fragment refs
// as props. Hydrated because the hero embeds an interactive SearchHero.
import InstanceHero from "@/components/composed/instance/InstanceHero";
import InstanceCommunities from "@/components/composed/instance/InstanceCommunities";
import type { GlobalStaticData } from "@/contexts/GlobalStaticContext/GlobalStaticContext";
import ChromeProviders from "../chrome/ChromeProviders";

type Props = {
  data: React.ComponentProps<typeof InstanceHero>["data"];
  communities: React.ComponentProps<typeof InstanceCommunities>["data"];
  globalData?: GlobalStaticData;
  route?: React.ComponentProps<typeof ChromeProviders>["route"];
  viewer?: React.ComponentProps<typeof ChromeProviders>["viewer"];
};

export default function InstanceContent({
  data,
  communities,
  globalData,
  route,
  viewer,
}: Props) {
  return (
    <ChromeProviders globalData={globalData} route={route} viewer={viewer}>
      <InstanceHero data={data} />
      <InstanceCommunities data={communities} />
    </ChromeProviders>
  );
}
