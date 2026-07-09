"use client";

// Centralized client-side routing hooks.
//
// This module is the single swap point for the Astro SSR migration: reimplement
// these on the History API / window.location (or astro:transitions) for React
// islands. `useParams` in particular has no direct Astro island equivalent —
// islands will receive route params as props from the .astro page instead.
// Application code must import routing hooks from here, never from
// "next/navigation" directly.
export {
  useRouter,
  usePathname,
  useSearchParams,
  useParams,
} from "next/navigation";
