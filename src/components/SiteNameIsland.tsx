"use client";

import { useEffect, useState } from "react";
import { type FragmentType, useFragment } from "@/lib/api/gql";
import { siteNameProofFragment } from "./SiteNameProof";

// Phase 0, milestone D: an interactive island. It receives the SAME masked
// fragment ref as a serialized prop (Astro JSON-serializes island props across
// the boundary), unmasks it with useFragment on the CLIENT, and carries
// client-only state (hydration flag + a click counter) to prove hydration ran.
export default function SiteNameIsland({
  data,
}: {
  data: FragmentType<typeof siteNameProofFragment>;
}) {
  const config = useFragment(siteNameProofFragment, data);
  const [hydrated, setHydrated] = useState(false);
  const [clicks, setClicks] = useState(0);

  useEffect(() => setHydrated(true), []);

  return (
    <span data-proof="island">
      name via client useFragment=<strong>{config.site?.installationName}</strong>
      {" — hydrated="}
      <em data-proof="hydrated">{hydrated ? "yes" : "no"}</em>
      {" — "}
      <button data-proof="counter" onClick={() => setClicks(clicks + 1)}>
        clicks: {clicks}
      </button>
    </span>
  );
}
