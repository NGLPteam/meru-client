"use server";

import { draftMode } from "next/headers";
import { revalidatePath } from "next/cache";

export async function exitDraftMode() {
  (await draftMode()).disable();
  revalidatePath("/", "layout");
}
