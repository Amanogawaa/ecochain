"use client";

import { ConvexReactClient } from "convex/react";
import { ConvexAuthProvider } from "@convex-dev/auth/react";

const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL ?? "";
const convex = new ConvexReactClient(convexUrl);

type AppConvexProviderProps = {
  children: React.ReactNode;
};

export default function AppConvexProvider({
  children,
}: AppConvexProviderProps) {
  return <ConvexAuthProvider client={convex}>{children}</ConvexAuthProvider>;
}
