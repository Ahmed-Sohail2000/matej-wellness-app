'use client';

import { useRef, useState } from 'react';

type Chart = { url: string; title?: string };

export default function Page() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [charts, setCharts] = useState<Chart[]>([]);
  const [selectedFileName, setSelectedFileName] = useState<string>('');

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const webhookUrl = process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL;

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
        setCharts(Array.isArray(data?.charts) ? data.charts : []);
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
          Upload 
