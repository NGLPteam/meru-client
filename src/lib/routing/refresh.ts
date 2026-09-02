// Soft-reload the current URL (a view transition, not a hard reload) so the
// server re-renders with new request state — e.g. a changed draft-mode cookie —
// while the ClientRouter loading bar animates.
import { navigate } from "astro:transitions/client";

export default function refresh() {
  navigate(window.location.href, { history: "replace" });
}
