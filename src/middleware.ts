import { sequence } from "astro:middleware";
import { attachUserAndSession } from "~/lib/middleware/attachUserAndSession";
import { attachRequestContext } from "~/lib/middleware/attachRequestContext";

export const onRequest = sequence(attachUserAndSession, attachRequestContext);
