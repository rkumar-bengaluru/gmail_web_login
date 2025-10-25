// components/providers.tsx (create this new file)
'use client';

import { SessionProvider as NextAuthSessionProvider } from 'next-auth/react';

export function Providers({
  children,
}: {
  children: React.ReactNode;
}) {
  return <NextAuthSessionProvider>{children}</NextAuthSessionProvider>;
}