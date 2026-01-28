async function getPaste(id: string) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/api/pastes/${id}`,
    { cache: "no-store" }
  );

  if (!res.ok) return null;
  return res.json();
}

export default async function PastePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const paste = await getPaste(id);

  if (!paste) {
    return (
      <main style={styles.container}>
        <div style={styles.card}>
          <h1 style={styles.title}>Paste not available</h1>
          <p style={styles.text}>
            This paste may have expired or does not exist.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>Paste</h1>

        <pre style={styles.code}>
          {paste.content}
        </pre>

        <div style={styles.meta}>
          {paste.views_remaining !== null && (
            <span>
              👁️ Views remaining: <b>{paste.views_remaining}</b>
            </span>
          )}

          {paste.expires_at && (
            <span>
              ⏳ Expires at:{" "}
              <b>{new Date(paste.expires_at).toLocaleString()}</b>
            </span>
          )}
        </div>
      </div>
    </main>
  );
}

/* ---------- Styles ---------- */

const styles: Record<string, React.CSSProperties> = {
  container: {
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "flex-start",
    backgroundColor: "#0f172a", // dark slate
    padding: "2rem",
  },

  card: {
    width: "100%",
    maxWidth: "720px",
    backgroundColor: "#020617", // near-black
    borderRadius: "12px",
    padding: "2rem",
    boxShadow: "0 20px 40px rgba(0,0,0,0.4)",
  },

  title: {
    marginBottom: "1rem",
    fontSize: "1.75rem",
    fontWeight: 600,
    color: "#e5e7eb",
  },

  text: {
    color: "#cbd5f5",
    fontSize: "1rem",
    lineHeight: 1.6,
  },

  code: {
    whiteSpace: "pre-wrap",
    backgroundColor: "#020617",
    color: "#e5e7eb",
    padding: "1rem",
    borderRadius: "8px",
    border: "1px solid #1e293b",
    fontSize: "0.95rem",
    lineHeight: 1.6,
    marginBottom: "1.5rem",
  },

  meta: {
    display: "flex",
    flexDirection: "column",
    gap: "0.5rem",
    fontSize: "0.9rem",
    color: "#94a3b8",
  },
};
