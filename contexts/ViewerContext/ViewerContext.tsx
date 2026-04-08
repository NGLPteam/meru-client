"use client";

import { createContext } from "react";

export interface ViewerContextProps {
  isAuthenticated: boolean;
  name?: string | null;
  allowedActions: readonly string[];
  uploadAccess?: boolean;
  uploadToken?: string | null;
  avatarUrl?: string | null;
}

const initialState: ViewerContextProps = {
  isAuthenticated: false,
  allowedActions: [],
  uploadAccess: false,
  uploadToken: null,
  avatarUrl: undefined,
};

const ViewerContext = createContext<ViewerContextProps>(initialState);

interface Props extends ViewerContextProps {
  children: React.ReactNode;
}

function ViewerContextProvider({ children, ...viewer }: Props) {
  return (
    <ViewerContext.Provider value={viewer}>{children}</ViewerContext.Provider>
  );
}

export default ViewerContext;

export { ViewerContextProvider };
