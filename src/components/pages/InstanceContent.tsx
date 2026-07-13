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
};

export default function InstanceContent({
  data,
  communities,
  globalData,
}: Props) {
  return (
    <ChromeProviders globalData={globalData}>
      <InstanceHero data={data} />
      <InstanceCommunities data={communities} />
    </ChromeProviders>
  );
}
