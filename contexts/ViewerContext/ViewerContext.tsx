"use client";

import { createContext, useEffect, useState } from "react";
import { setToken } from "@/lib/auth/token";

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
  isPreview?: boolean;
  children: React.ReactNode;
}

function ViewerContextProvider({ children, isPreview }: Props) {
  const [viewer, setViewer] = useState<ViewerContextProps>({
    ...initialState,
    isPreview,
  });

  // Keep isPreview in sync with the server value (draftMode is read on the
  // server and can change on router.refresh() when entering/exiting preview).
  useEffect(() => {
    setViewer((prev) => ({ ...prev, isPreview }));
  }, [isPreview]);

  useEffect(() => {
    let active = true;

    fetch("/api/viewer", { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => {
        if (!active) return;

        const { accessToken, ...viewerData } = data;

        if (accessToken) setToken(accessToken);

        setViewer((prev) => ({ ...prev, ...viewerData }));
      })
      .catch(() => {});

    return () => {
      active = false;
    };
  }, []);

  return (
    <ViewerContext.Provider value={viewer}>{children}</ViewerContext.Provider>
  );
}

export default ViewerContext;

export { ViewerContextProvider };
