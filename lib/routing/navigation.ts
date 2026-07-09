// Centralized server-side navigation helpers.
//
// This module is the single swap point for the Astro SSR migration:
//   notFound() -> return a 404 response
//   redirect() -> Astro.redirect(...)
// Application code must import these from here, never from "next/navigation"
// directly, so the framework swap touches only this file.
export { notFound, redirect } from "next/navigation";
