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
        body: formData, // multipart/form-data automatically set
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
        // If your n8n Respond to Webhook returns HTML (optional):
        setMessage('Received HTML response');
        // You can render dangerouslySetInnerHTML if desired
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
    <main style={{ maxWidth: 800, margin: '40px auto', padding: '0 20px' }}>
      <h1>Upload & Generate Charts</h1>
      <p>Submit your details and a data file. We’ll generate charts via n8n + QuickChart.</p>

      {!webhookUrl && (
        <div style={{ padding: 12, background: '#ffe9e9', border: '1px solid #ffb3b3', marginBottom: 16 }}>
          Missing NEXT_PUBLIC_N8N_WEBHOOK_URL. Add it in Vercel Project Settings → Environment Variables.
        </div>
      )}

      <form onSubmit={handleSubmit} encType="multipart/form-data">
        <div style={{ display: 'grid', gap: 12, marginBottom: 16 }}>
          <label>
            Name
            <input name="name" placeholder="Your name" />
          </label>
          <label>
            Email
            <input name="email" type="email" placeholder="you@example.com" />
          </label>
          <label>
            Data File
            <input name="file" type="file" accept=".csv,.xlsx,.json" />
          </label>
          <label>
            Notes (optional)
            <textarea name="notes" placeholder="Anything we should know?" rows={3} />
          </label>
        </div>

        <button type="submit" disabled={loading || !webhookUrl}>
          {loading ? 'Submitting…' : 'Submit'}
        </button>
      </form>

      {error && (
        <div style={{ marginTop: 16, color: '#b00020' }}>
          Error: {error}
        </div>
      )}

      {message && (
        <div style={{ marginTop: 16 }}>
          {message}
        </div>
      )}

      {charts?.length > 0 && (
        <section style={{ marginTop: 24 }}>
          <h2>Charts</h2>
          <div style={{ display: 'grid', gap: 16 }}>
            {charts.map((c, i) => (
              <figure key={i} style={{ margin: 0 }}>
                <img src={c.url} alt={c.title || `Chart ${i + 1}`} style={{ maxWidth: '100%', height: 'auto' }} />
                {(c.title || c.url) && (
                  <figcaption style={{ fontSize: 14, color: '#666' }}>
                    {c.title || c.url}
                  </figcaption>
                )}
              </figure>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
