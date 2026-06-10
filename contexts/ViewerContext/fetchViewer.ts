import { getAPIURL } from "@/lib/relay/network";
import { getGQLHeaders } from "@/lib/relay/apiHeaders";
import type { ViewerContextProps } from "./ViewerContext";

const VIEWER_QUERY = `
  query ViewerQuery {
    viewer {
      name
      allowedActions
      primaryRole {
        identifier
      }
      canAccessAdmin
      uploadAccess
      uploadToken
      avatar {
        small {
          png {
            url
            alt
          }
        }
      }
    }
  }
`;

export interface ViewerData {
  name?: string | null;
  allowedActions?: readonly string[];
  primaryRole?: {
    identifier?: string | null;
  } | null;
  canAccessAdmin?: boolean;
  uploadAccess?: boolean;
  uploadToken?: string | null;
  avatar?: {
    small?: {
      png?: {
        url?: string | null;
        alt?: string | null;
      } | null;
    } | null;
  } | null;
}

export async function fetchViewer(
  sessionToken?: string,
): Promise<ViewerData | null> {
  try {
    const resp = await fetch(getAPIURL(), {
      method: "POST",
      headers: getGQLHeaders(sessionToken),
      body: JSON.stringify({ query: VIEWER_QUERY }),
      cache: "no-store",
    });
    const json = await resp.json();
    return json.data?.viewer ?? null;
  } catch {
    return null;
  }
}

export async function resolveViewer(
  sessionToken?: string,
): Promise<ViewerContextProps> {
  const viewer = sessionToken ? await fetchViewer(sessionToken) : null;

  if (viewer && viewer.name !== "Anonymous User") {
    return {
      isAuthenticated: true,
      name: viewer.name,
      allowedActions: viewer.allowedActions ?? [],
      primaryRole: viewer.primaryRole?.identifier ?? null,
      uploadAccess: viewer.uploadAccess ?? false,
      uploadToken: viewer.uploadToken ?? null,
      avatarUrl: viewer.avatar?.small?.png?.url ?? undefined,
      canAccessAdmin: viewer?.canAccessAdmin ?? false,
    };
  }
  return { isAuthenticated: false, allowedActions: [] };
}
