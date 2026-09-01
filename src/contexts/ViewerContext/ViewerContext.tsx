"use client";

import { createContext, useEffect, useState } from "react";

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

const ViewerContext = createContext<ViewerContextProps>(initialState);

interface Props {
  // Server-resolved viewer, seeded via props (getViewer → resolveViewer). The
  // access token never reaches the browser — identity is fully prop-seeded, so
  // there is no client `/api/viewer` fetch.
  viewer?: ViewerContextProps;
  isPreview?: boolean;
  children: React.ReactNode;
}

function ViewerContextProvider({ children, viewer, isPreview }: Props) {
  const [state, setViewer] = useState<ViewerContextProps>({
    ...initialState,
    ...viewer,
    isPreview,
  });

  // Keep isPreview in sync with the server value (draftMode is read on the
  // server and can change on navigation when entering/exiting preview).
  useEffect(() => {
    setViewer((prev) => ({ ...prev, isPreview }));
  }, [isPreview]);

  // Re-seed when the server viewer changes across a navigation (the persisted
  // header/footer island updates its props on View-Transitions navigations, and content
  // islands remount). `viewer` omits `isPreview`, so it never clobbers the sync
  // above. Loop-safe: within a stable parent render the prop reference is stable.
  useEffect(() => {
    if (!viewer) return;
    setViewer((prev) => ({ ...prev, ...viewer }));
  }, [viewer]);

  return (
    <ViewerContext.Provider value={state}>{children}</ViewerContext.Provider>
  );
}

export default ViewerContext;

export { ViewerContextProvider };
