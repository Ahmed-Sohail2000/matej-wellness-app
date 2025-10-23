'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';

type Chart = { url: string; title?: string };

export default function Page() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [charts, setCharts] = useState<Chart[]>([]);
  const [selectedFileName, setSelectedFileName] = useState<string>('');

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const webhookUrl = process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL;
  const router = useRouter();

  function triggerFilePicker() {
    fileInputRef.current?.click();
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    setSelectedFileName(f ? f.name : '');
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);
    setCharts([]);

    if (!webhookUrl) {
      setError('Missing NEXT_PUBLIC_N8N_WEBHOOK_URL');
      setLoading(false);
      return;
    }

    const form = e.currentTarget;
    const formData = new FormData(form);

    try {
      const res = await fetch(webhookUrl as string, {
        method: 'POST',
        body: formData,
      });

      const contentType = res.headers.get('content-type') || '';

      if (!res.ok) {
        const txt = await res.text();
        throw new Error(`HTTP ${res.status}: ${txt || 'No response body'}`);
      }

      if (contentType.includes('application/json')) {
        const data = await res.json();
        setMessage(data?.message ?? 'Success');

        const list = Array.isArray(data?.charts) ? data.charts : [];
        setCharts(list);

        // Build query with up to two charts including titles
        const c1 = list?.[0] || {};
        const c2 = list?.[1] || {};
        const search = new URLSearchParams();
        if (c1?.url) {
          search.set('url1', c1.url);
          if (c1?.title) search.set('title1', c1.title);
        }
        if (c2?.url) {
          search.set('url2', c2.url);
          if (c2?.title) search.set('title2', c2.title);
        }

        // Navigate to /view with query params
        router.push(`/view?${search.toString()}`);
      } else {
        const text = await res.text();
        setMessage(text || 'Submitted successfully (non-JSON response)');
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to fetch (network/CORS/URL issue)');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main
      style={{
        background: '#ffffff',
        color: '#000000',
        minHeight: '100vh',
        padding: '40px 20px',
      }}
    >
      <div style={{ maxWidth: 860, margin: '0 auto' }}>
        <h1 style={{ marginBottom: 8 }}>Upload & Generate Charts</h1>
        <p style={{ marginBottom: 24 }}>
          Upload a file and we’ll generate charts via n8n + QuickChart.
        </p>

        {!webhookUrl && (
          <div
            style={{
              padding: 12,
              background: '#ffe9e9',
              border: '1px solid #ffb3b3',
              color: '#000',
              marginBottom: 16,
            }}
          >
            Missing NEXT_PUBLIC_N8N_WEBHOOK_URL. Set it in Vercel → Settings → Environment Variables, then redeploy.
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          encType="multipart/form-data"
          style={{
            background: '#000000',
            color: '#ffffff',
            borderRadius: 12,
            padding: 20,
            boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
          }}
        >
          <div style={{ display: 'grid', gap: 12, marginBottom: 16 }}>
            <label style={{ display: 'grid', gap: 6 }}>
              <span>Name</span>
              <input
                name="name"
                placeholder="Your name"
                style={{
                  background: '#111',
                  color: '#fff',
                  border: '1px solid #333',
                  borderRadius: 8,
                  padding: '10px 12px',
                  outline: 'none',
                }}
              />
            </label>

            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              name="file"
              type="file"
              accept=".csv,.xlsx,.json"
              onChange={handleFileChange}
              style={{ display: 'none' }}
            />

            {/* Visible button to pick a file */}
            <div>
              <button
                type="button"
                onClick={triggerFilePicker}
                style={{
                  background: '#ffffff',
                  color: '#000000',
                  border: '1px solid #000',
                  borderRadius: 8,
                  padding: '10px 16px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  marginRight: 12,
                }}
              >
                Choose File
              </button>
              <span style={{ color: '#ccc', fontSize: 14 }}>
                {selectedFileName || 'No file selected'}
              </span>
            </div>

            <label style={{ display: 'grid', gap: 6 }}>
              <span>Notes (optional)</span>
              <textarea
                name="notes"
                placeholder="Anything we should know?"
                rows={3}
                style={{
                  background: '#111',
                  color: '#fff',
                  border: '1px solid #333',
                  borderRadius: 8,
                  padding: '10px 12px',
                  outline: 'none',
                }}
              />
            </label>
          </div>

          <button
            type="submit"
            disabled={loading || !webhookUrl}
            style={{
              background: '#ffffff',
              color: '#000000',
              border: '1px solid #000',
              borderRadius: 8,
              padding: '10px 16px',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1,
              fontWeight: 600,
            }}
          >
            {loading ? 'Submitting…' : 'Submit'}
          </button>
        </form>

        {error && (
          <div style={{ marginTop: 16, color: '#b00020' }}>
            Error: {error}
          </div>
        )}

        {message && (
          <div style={{ marginTop: 16, color: '#000' }}>
            {message}
          </div>
        )}

        {charts?.length > 0 && (
          <section style={{ marginTop: 24 }}>
            <h2 style={{ color: '#000' }}>Charts</h2>
            <div style={{ display: 'grid', gap: 16 }}>
              {charts.map((c, i) => (
                <figure key={i} style={{ margin: 0 }}>
                  <img
                    src={c.url}
                    alt={c.title || `Chart ${i + 1}`}
                    style={{
                      maxWidth: '100%',
                      height: 'auto',
                      borderRadius: 8,
                      border: '1px solid #eee',
                      background: '#fff',
                    }}
                  />
                  {(c.title || c.url) && (
                    <figcaption style={{ fontSize: 14, color: '#555' }}>
                      {c.title || c.url}
                    </figcaption>
                  )}
                </figure>
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
