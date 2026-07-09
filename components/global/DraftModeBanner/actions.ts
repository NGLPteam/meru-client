"use server";

import { revalidatePath } from "next/cache";
import { disableDraftMode } from "@/lib/request/draftMode";

export async function exitDraftMode() {
  await disableDraftMode();
  revalidatePath("/", "layout");
}
