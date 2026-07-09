"use server";

import joinURL from "url-join";
import { enableDraftMode, disableDraftMode } from "@/lib/request/draftMode";
import {
  auth,
  signIn as doSignIn,
  signOut as doSignOut,
} from "@/lib/auth/initAuth";
import {
  NEXT_PUBLIC_KEYCLOAK_URL,
  NEXT_PUBLIC_KEYCLOAK_REALM,
  NEXT_PUBLIC_KEYCLOAK_CLIENT_ID,
  NEXT_KEYCLOAK_CLIENT_SECRET,
} from "@/lib/auth/keycloak";

export async function signIn() {
  await doSignIn("keycloak");
}

export async function enterPreviewMode() {
  await enableDraftMode();
}

export async function signOut() {
  const session = await auth();

  await disableDraftMode();

  if (session?.refreshToken) {
    try {
      const logoutUrl = joinURL(
        NEXT_PUBLIC_KEYCLOAK_URL,
        "realms",
        NEXT_PUBLIC_KEYCLOAK_REALM,
        "protocol/openid-connect/logout",
      );

      const params = new URLSearchParams({
        client_id: NEXT_PUBLIC_KEYCLOAK_CLIENT_ID,
        client_secret: NEXT_KEYCLOAK_CLIENT_SECRET,
        refresh_token: session.refreshToken,
      });

      await fetch(logoutUrl, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: params,
      });
    } catch {
      // ignore — local sign-out below still runs
    }
  }

  await doSignOut();
}
