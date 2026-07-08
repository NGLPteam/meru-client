// Client-side access-token holder. Replaces the old sessionStorage mirror in
// lib/auth/token.ts: ViewerContext fetches /api/viewer and pushes the access
// token here; the client-side urql Provider reads it (via getClientToken) in
// its fetchOptions closure. Module-scoped so the urql client never has to be
// rebuilt when the token arrives. No-ops / empty on the server.
let currentToken: string | undefined;

export function setClientToken(token?: string) {
  currentToken = token;
}

export function getClientToken(): string | undefined {
  return currentToken;
}
