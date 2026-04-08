"use client";

import { useRef, PropsWithChildren } from "react";
import { RelayEnvironmentProvider as RelayProvider } from "react-relay";
import { RecordMap } from "relay-runtime/lib/store/RelayStoreTypes";
import { getCurrentEnvironment } from "./environment";

export default function RelayEnvironmentProvider(
  props: {
    initialRecords?: RecordMap;
  } & PropsWithChildren,
) {
  const env = useRef(getCurrentEnvironment());

  return (
    <>
      {/* @ts-expect-error react-relay and relay-runtime have slightly different types */}
      <RelayProvider environment={env?.current}>{props.children}</RelayProvider>
    </>
  );
}
