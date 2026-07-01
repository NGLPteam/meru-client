import { auth } from "@/lib/auth/initAuth";
import { resolveViewer } from "@/contexts/ViewerContext/fetchViewer";

// Fetch viewer in a separate route, so we can satisfy two constraints:
// (1) maintain ISR caching for non-logged in views
// (2) serve preview content at the same route as public view
export const dynamic = "force-dynamic";

export async function GET() {
  const session = await auth();
  const viewer = await resolveViewer(session?.accessToken);

  return Response.json({
    ...viewer,
    accessToken: session?.accessToken ?? null,
  });
}
