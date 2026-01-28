type PasteResponse = {
  content: string;
  expires_at: number | null;
  views_remaining: number | null;
};

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function PastePage({ params }: PageProps) {
  const { id } = await params;

  const baseUrl = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : "http://localhost:3000";

  const res = await fetch(`${baseUrl}/api/pastes/${id}`, {
    cache: "no-store",
  });

  if (!res.ok) {
    return (
      <main style={styles.container}>
        <div style={styles.card}>
          <h1>Paste not available</h1>
          <p>This paste may have expired or does not exist.</p>
        </div>
      </main>
    );
  }

  const paste: PasteResponse = await res.json();

  return (
    <main style={styles.container}>
      <div style={styles.card}>
        <h1>Paste</h1>

        <pre style={styles.pre}>{paste.content}</pre>

        {paste.views_remaining !== null && (
          <p style={styles.meta}>
            👁️ Views remaining: {paste.views_remaining}
          </p>
        )}

        {paste.expires_at && (
          <p style={styles.meta}>
            ⏰ Expires at:{" "}
            {new Date(paste.expires_at).toLocaleString()}
          </p>
        )}
      </div>
    </main>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    backgroundColor: "#020617",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    color: "#e5e7eb",
  },
  card: {
    maxWidth: "700px",
    width: "100%",
    padding: "24px",
    border: "1px solid #1e293b",
    borderRadius: "12px",
    backgroundColor: "#020617",
  },
  pre: {
    whiteSpace: "pre-wrap" as const,
    wordBreak: "break-word" as const,
    marginTop: "12px",
  },
  meta: {
    marginTop: "12px",
    fontSize: "14px",
    color: "#9ca3af",
  },
};
