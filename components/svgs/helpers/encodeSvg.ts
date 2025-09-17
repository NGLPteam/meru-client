import ReactDOMServer from "react-dom/server";
import type { ReactNode } from "react";

export function encodeSvg(reactElement: ReactNode) {
  return (
    "data:image/svg+xml," +
    encodeURIComponent(ReactDOMServer.renderToStaticMarkup(reactElement))
  );
}
