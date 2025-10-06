"use client";

import { ApolloProvider } from "@apollo/client/react";
import { apolloClient } from "../lib/graphql/client"; // config Apollo Client của bạn

export default function ApolloProviderWrapper({ children }: { children: React.ReactNode }) {
  return <ApolloProvider client={apolloClient}>{children}</ApolloProvider>;
}
