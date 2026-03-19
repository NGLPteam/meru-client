"use client";

import "@/styles/global.css";

import ILISARNIQ from "@/styles/fonts/ilisarniq";
import Button from "@/components/atomic/Button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html
      lang="en"
      dir={"ltr"}
      className={`${ILISARNIQ.variable} theme-custom-cream theme-font-ilisarniq`}
    >
      <body className="a-bg-neutral00">
        <div
          className="l-container-wide l-flex l-flex--align-center"
          style={{ minHeight: "40vh", justifyContent: "center" }}
        >
          <div className="t-rte t-align-center">
            <h2>A server error occured!</h2>
            <p>global</p>
            <p>{error?.message}</p>
            <Button onClick={reset} size="sm">
              Try Again
            </Button>
          </div>
        </div>
      </body>
    </html>
  );
}
