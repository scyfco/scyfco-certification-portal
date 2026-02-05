'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const checkSession = async () => {
      try {
        const response = await fetch('/api/auth/me');
        if (response.ok) {
          router.push('/ds-mentors');
        } else {
          router.push('/login');
        }
      } catch {
        router.push('/login');
      }
    };

    checkSession();
  }, [router]);

  return null;
}
