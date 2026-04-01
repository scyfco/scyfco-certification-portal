import { Suspense } from 'react';
import DSMentorsPageClient from './DSMentorsPageClient';

export default function Page() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-100" />}>
      <DSMentorsPageClient />
    </Suspense>
  );
}
