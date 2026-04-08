"use client";

import { useContext, PropsWithChildren } from "react";
import { RecordSource } from "relay-runtime";
import { ReactRelayContext } from "react-relay";
import { Environment } from "relay-runtime/lib/store/RelayStoreTypes";
import { setToken } from "@/lib/auth/token";

type Props = PropsWithChildren & {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  records: Record<string, any>;
  sessionToken?: string;
};

export default function UpdateClientEnvironment({
  children,
  records,
  sessionToken,
}: Props) {
  const value = useContext(ReactRelayContext) ?? {};

  const { environment } = value as { environment: Environment };

  const source = new RecordSource(records);

  if (environment) {
    const store = environment.getStore();

    store.publish(source);
  }

  if (sessionToken) {
    setToken(sessionToken);
  }

  return <>{children}</>;
}
