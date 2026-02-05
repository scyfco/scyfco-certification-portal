'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

type ProtectedRouteProps = {
  children: React.ReactNode;
};

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    const checkSession = async () => {
      try {
        const response = await fetch('/api/auth/me', { signal: controller.signal });
        if (response.ok) {
          setAllowed(true);
        } else {
          router.push('/login');
        }
      } catch {
        if (!controller.signal.aborted) {
          router.push('/login');
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    checkSession();
    return () => controller.abort();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center text-sm text-gray-500">
        Vérification de la session...
      </div>
    );
  }
  if (!allowed) return null;
  return <>{children}</>;
}
