
'use client';

import { useUser } from '@/firebase/auth/use-user';

interface AuthWrapperProps {
  children: (user: any, isLoading: boolean) => React.ReactNode;
}

export default function AuthWrapper({ children }: AuthWrapperProps) {
  const { user, isUserLoading } = useUser();
  return <>{children(user, isUserLoading)}</>;
}
