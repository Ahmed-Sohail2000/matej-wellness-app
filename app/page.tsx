'use client';

import { useState } from 'react';

type Chart = { url: string; title?: string };

export default function Page() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [charts, setCharts] = useState<Chart[]>([]);

  const webhookUrl = process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);
    setCharts([]);

    const form = e.currentTarget;
    const formData = new FormData(form);

    try {
      const res = await fetch(webhookUrl as string, {
        method: 'POST',
        body: formData,
      });

      const contentType = res.headers.get('content-type') || '';
      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Request failed (${res.status}): ${text}`);
      }

      if (contentType.includes('application/json')) {
        const data = await res.json();
        setMessage(data?.message ?? 'Success');
        setCharts(Array.isArray(data?.charts) ? data.charts : []);
      } else if (contentType.includes('text/html')) {
        const html = await res.text();
        setMessage('Received HTML response');
        // Optionally render HTML: <div dangerouslySetInnerHTML={{ __html: html }} />
      } else {
        const text = await res.text();
        setMessage(text || 'Submitted successfully');
      }
    } catch (err: any) {
      setError(err?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main
      style={{
        background: '#ffffff',      // white page background
        color: '#000000',           // black default text
        minHeight: '100vh',
        padding: '40px 20px',
      }}
    >
      <div style={{ maxWidth: 860, margin: '0 auto' }}>
        <h1 style={{ marginBottom: 8 }}>Upload & Generate Charts</h1>
        <p style={{ marginBottom: 24 }}>
          Submit your details and a data file. We’ll generate charts via n8n + QuickChart.
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
            Missing NEXT_PUBLIC_N8N_WEBHOOK_URL. Add it in Vercel Project Settings → Environment Variables.
          </div>
        )}

        {/* Black form card */}
        <form
          onSubmit={handleSubmit}
          encType="multipart/form-data"
          style={{
            background: '#000000',
            color: '#ffffff', // white text inside the dark form
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

            {/* Email removed as requested */}

            <label style={{ display: 'grid', gap: 6 }}>
              <span>Data File</span>
              <input
                name="file"
                type="file"
                accept=".csv,.xlsx,.json"
                style={{
                  background: '#111',
                  color: '#fff',
                  border: '1px solid #333',
                  borderRadius: 8,
                  padding: '8px',
                  outline: 'none',
                }}
              />
            </label>

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
              background: '#ffffff',  // white button for contrast
              color: '#000000',       // black text on button
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
          <div style={{ marginTop: 16, color: '#000' /* black text outside form */ }}>
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
                    style={{ maxWidth: '100%', height: 'auto', borderRadius: 8, border: '1px solid #eee' }}
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
