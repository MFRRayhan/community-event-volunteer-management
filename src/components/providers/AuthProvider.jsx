"use client";

import { SessionProvider } from "next-auth/react";

/**
 * AuthProvider Client Component
 * Wraps children with NextAuth SessionProvider for client-side useSession hooks
 */
export default function AuthProvider({ children }) {
  return <SessionProvider>{children}</SessionProvider>;
}
