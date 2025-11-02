
'use client';

import { FirebaseProvider } from './provider';

// This is a bit of a hack to ensure that the Firebase provider is only
// rendered on the client.
export function FirebaseClientProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return <FirebaseProvider>{children}</FirebaseProvider>;
}
