"use client";

import { useState } from "react";

export default function HomePage() {
  const [copied, setCopied] = useState(false);
  const [content, setContent] = useState("");
  const [ttl, setTtl] = useState("");
  const [maxViews, setMaxViews] = useState("");
  const [resultUrl, setResultUrl] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (loading) return; // ✅ prevent double submit

    setError("");
    setResultUrl("");

    if (!content.trim()) {
      setError("Paste content cannot be empty");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/pastes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content,
          ttl_seconds: ttl ? Number(ttl) : undefined,
          max_views: maxViews ? Number(maxViews) : undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data?.error || "Failed to create paste");
        return;
      }

      setResultUrl(data.url);
      setCopied(false);
      setContent("");
      setTtl("");
      setMaxViews("");
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>Pastebin Lite</h1>

        <form onSubmit={handleSubmit} style={styles.form}>
          <textarea
            placeholder="Enter your paste here..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            style={styles.textarea}
          />

          <input
            type="number"
            min="1"
            placeholder="TTL in seconds (optional)"
            value={ttl}
            onChange={(e) => setTtl(e.target.value)}
            style={styles.input}
          />

          <input
            type="number"
            min="1"
            placeholder="Max views (optional)"
            value={maxViews}
            onChange={(e) => setMaxViews(e.target.value)}
            style={styles.input}
          />

          <p style={styles.helperText}>
            ⚠️ Each page open (including refresh) counts as one view.
          </p>

          <button
            type="submit"
            style={{
              ...styles.button,
              opacity: loading ? 0.7 : 1,
              cursor: loading ? "not-allowed" : "pointer",
            }}
            disabled={loading}
          >
            {loading ? "Creating..." : "Create Paste"}
          </button>
        </form>

        {error && <p style={styles.error}>{error}</p>}

        {resultUrl && (
          <div style={styles.successBox}>
            <p>
              Paste created:{" "}
              <a href={resultUrl} target="_blank" rel="noreferrer">
                {resultUrl}
              </a>
            </p>

            <button
              style={styles.copyButton}
              onClick={async () => {
                await navigator.clipboard.writeText(resultUrl);
                setCopied(true);
              }}
            >
              Copy link
            </button>

            {copied && <span style={styles.copiedText}>✔ Copied!</span>}
          </div>
        )}
      </div>
    </main>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    minHeight: "100vh",
    backgroundColor: "#020617",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: "24px",
    color: "#e5e7eb",
  },
  card: {
    width: "100%",
    maxWidth: "600px",
    border: "1px solid #1e293b",
    borderRadius: "12px",
    padding: "24px",
    backgroundColor: "#020617",
  },
  title: {
    textAlign: "center",
    marginBottom: "16px",
    fontSize: "28px",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  textarea: {
    minHeight: "140px",
    padding: "10px",
    borderRadius: "6px",
    border: "1px solid #1e293b",
    backgroundColor: "#020617",
    color: "#e5e7eb",
    resize: "vertical",
  },
  input: {
    padding: "10px",
    borderRadius: "6px",
    border: "1px solid #1e293b",
    backgroundColor: "#020617",
    color: "#e5e7eb",
  },
  button: {
    padding: "12px",
    borderRadius: "6px",
    border: "none",
    backgroundColor: "#2563eb",
    color: "#ffffff",
    fontSize: "16px",
  },
  error: {
    marginTop: "12px",
    color: "#f87171",
  },
  helperText: {
    fontSize: "13px",
    color: "#9ca3af",
    marginTop: "-6px",
  },
  successBox: {
    marginTop: "12px",
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    color: "#4ade80",
  },
  copyButton: {
    alignSelf: "flex-start",
    padding: "6px 12px",
    borderRadius: "6px",
    border: "1px solid #1e293b",
    backgroundColor: "#020617",
    color: "#e5e7eb",
    cursor: "pointer",
    fontSize: "14px",
  },
  copiedText: {
    fontSize: "13px",
    color: "#22c55e",
  },
};
