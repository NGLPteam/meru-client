// Server-only (sitemap base URL). Guard `process` so that eager dev-mode barrel
// loading of @/helpers into a client/island bundle doesn't throw "process is not
// defined" — these values are only ever read server-side, where process exists.
const procEnv: Record<string, string | undefined> =
  typeof process !== "undefined" ? process.env : {};

const env = procEnv.VERCEL_ENV || "development";

const EXTERNAL_DATA_URL = {
  production: procEnv.NEXT_PUBLIC_FE_URL || procEnv.VERCEL_URL,
  preview: procEnv.VERCEL_URL,
  development: "http://localhost:3001",
}[env];

export default EXTERNAL_DATA_URL;
