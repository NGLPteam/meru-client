import { sequence } from "astro:middleware";
import { attachUserAndSession } from "~/lib/middleware/attachUserAndSession";

// Middleware chain. Minimal for the auth phase; #9 re-homes/expands this
// (route protection, draft mode) into a fuller sequence.
export const onRequest = sequence(attachUserAndSession);
