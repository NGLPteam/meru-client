"use client";

import { useRef, PropsWithChildren } from "react";
import { useSession } from "next-auth/react";
import { RelayEnvironmentProvider as RelayProvider } from "react-relay";
import { RecordMap } from "relay-runtime/lib/store/RelayStoreTypes";
import { getCurrentEnvironment } from "./environment";

export default function RelayEnvironmentProvider(
  props: {
    initialRecords?: RecordMap;
  } & PropsWithChildren,
) {
  const session = useSession();

  const sessionRef = useRef(session?.data || undefined);

  const env = useRef(
    getCurrentEnvironment({
      sessionToken: sessionRef.current?.accessToken,
    }),
  );

  return (
    <>
      {/* @ts-expect-error react-relay and relay-runtime have slightly different types */}
      <RelayProvider environment={env?.current}>{props.children}</RelayProvider>
    </>
  );
}
