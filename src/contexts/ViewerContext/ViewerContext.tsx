"use client";

import { createContext } from "react";

export interface ViewerContextProps {
  isAuthenticated: boolean;
  name?: string | null;
  allowedActions: readonly string[];
  primaryRole?: string | null;
  isPreview?: boolean;
  uploadAccess?: boolean;
  uploadToken?: string | null;
  avatarUrl?: string | null;
  canAccessAdmin?: boolean;
}

const initialState: ViewerContextProps = {
  isAuthenticated: false,
  allowedActions: [],
  uploadAccess: false,
  uploadToken: null,
  avatarUrl: undefined,
};

// No provider exists any more — the MDX slot wrappers read this context's
// anonymous default until they switch to a prop/server value (astroification
// Phase 8). getViewer/resolveViewer still use ViewerContextProps as the shape
// of the server-resolved viewer.
const ViewerContext = createContext<ViewerContextProps>(initialState);

export default ViewerContext;
