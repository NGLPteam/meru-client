"use server";

import { draftMode } from "next/headers";
import { signIn as doSignIn, signOut as doSignOut } from "@/lib/auth/initAuth";

export async function signIn() {
  await doSignIn("keycloak");
}

export async function signOut() {
  (await draftMode()).disable();
  await doSignOut();
}
