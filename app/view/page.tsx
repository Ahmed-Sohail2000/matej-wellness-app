'use client';

import { useSearchParams } from 'next/navigation';

export default function ViewCharts() {
  const params = useSearchParams();
  const url1 = params.get('url1') || '';
  const url2 = params.get('url2') || '';

  const urls = [url1, url2].filter(Boolean);

  return (
    <main style={{ minHeight: '100vh', padding: 24, background: '#fff', color: '#000' }}>
      <h1>Charts Viewer</h1>

      {urls.length === 0 ? (
        <p>No chart URLs provided. Go back and paste them.</p>
      ) : (
        <div style={{ display: 'grid', gap: 16 }}>
          {urls.map((u, i) => (
            <figure key={i} style={{ margin: 0 }}>
              <img
                src={u}
                alt={`Chart ${i + 1}`}
                style={{
                  maxWidth: '100%',
                  height: 'auto',
                  borderRadius: 8,
                  border: '1px solid #eee',
                  background: '#fff',
                }}
              />
              <figcaption style={{ fontSize: 14, color: '#555', wordBreak: 'break-all' }}>
                {u}
              </figcaption>
            </figure>
          ))}
        </div>
      )}
    </main>
  );
}
