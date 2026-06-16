"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily:
            "ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, sans-serif",
          background: "#f0f4f8",
          color: "#1a2332",
          textAlign: "center",
          padding: "0 24px",
        }}
      >
        <div style={{ fontSize: 44, color: "#2563eb" }}>∑</div>
        <h1 style={{ fontSize: 26, margin: "16px 0 8px" }}>
          Something went wrong
        </h1>
        <p style={{ color: "#4a5568", maxWidth: 420 }}>
          The application hit an unexpected error.
          {error.digest ? ` Reference: ${error.digest}` : ""}
        </p>
        <button
          onClick={reset}
          style={{
            marginTop: 20,
            background: "#2563eb",
            color: "#fff",
            border: "none",
            borderRadius: 6,
            padding: "10px 20px",
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          Reload
        </button>
      </body>
    </html>
  );
}
