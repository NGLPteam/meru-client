export { default } from "./ViewerContext";
export {
  ViewerContextProvider,
  type ViewerContextProps,
} from "./ViewerContext";
// NOTE: the server-only viewer fetch (fetchViewer/resolveViewer, which imports
// the urql client that reads NEXT_PUBLIC_API_URL) is intentionally NOT
// re-exported here. This barrel is imported by client islands (via the provider
// and useViewerContext); re-exporting the server fetch would drag the API-URL
// client into the browser bundle. Server code imports it from "./fetchViewer".
