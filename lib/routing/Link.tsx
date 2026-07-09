// Centralized link component. Single swap point for the Astro SSR migration
// (swap for an <a> or a framework Link). Application code must import the link
// component from here, never from "next/link" directly.
export { default, type LinkProps } from "next/link";
