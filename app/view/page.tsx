// app/view/page.tsx
'use client';

import { Suspense } from 'react';
import ChartsView from 'app/view/ChartsView.tsx';

export default function ViewPage() {
  return (
    <Suspense fallback={<div style={{ padding: 24 }}>Loading…</div>}>
      <ChartsView />
    </Suspense>
  );
}
