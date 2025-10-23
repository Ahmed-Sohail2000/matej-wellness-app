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

        // Navigate to /view with up to two URLs
        const url1 = list?.[0]?.url || '';
        const url2 = list?.[1]?.url || '';
        const search = new URLSearchParams();
        if (url1) search.set('url1', url1);
        if (url2) search.set('url2', url2);
        router.push(`/view?${search.toString()}`);

        // Optionally store in state for staying on current page
        setCharts(list);
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
    /* ... keep your existing JSX as-is ... */
    // No other structural changes required
  );
}
