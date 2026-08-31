import { sequence } from "astro:middleware";
import { attachUserAndSession } from "~/lib/middleware/attachUserAndSession";

export const onRequest = sequence(attachUserAndSession);
