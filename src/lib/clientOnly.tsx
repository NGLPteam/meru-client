"use client";

import {
  lazy,
  Suspense,
  useSyncExternalStore,
  type ComponentType,
  type ReactNode,
} from "react";

// Drop-in replacement for next/dynamic(loader, { ssr: false }).
//
// Renders the fallback on the server and during the first client (hydration)
// pass, then lazy-loads and renders the module on the client. Used for
// components that touch the DOM/window at import time (pdf.js,
// react-google-charts) and so cannot be server-rendered. Portable to the Astro
// SSR migration, where the equivalent is a `client:only` island at the usage
// site. Must be called from a client module (it returns a hook-using component).
export default function clientOnly<P extends object>(
  loader: () => Promise<{ default: ComponentType<P> }>,
  fallback: ReactNode = null,
): ComponentType<P> {
  const Lazy = lazy(loader);
  return function ClientOnlyComponent(props: P) {
    const isClient = useSyncExternalStore(
      () => () => {},
      () => true,
      () => false,
    );
    if (!isClient) return <>{fallback}</>;
    return (
      <Suspense fallback={fallback}>
        <Lazy {...props} />
      </Suspense>
    );
  };
}
