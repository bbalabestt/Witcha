"use client";

import "@/styles/globals.css";

/** Last-resort boundary when the root layout itself fails; keeps to brand colours without the chrome. */
export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="en-AU">
      <body>
        <main style={{ minHeight: "100dvh", display: "grid", placeItems: "center", padding: "var(--space-6) var(--gutter)", textAlign: "center" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)", alignItems: "center" }}>
            <h1 className="heading-1">Something spilled.</h1>
            <p>WITCHA MATCHA didn’t load. Please try again.</p>
            <button type="button" onClick={reset} style={{ height: 52, padding: "0 28px", background: "var(--action-primary)", color: "var(--action-primary-text)" }} className="label">
              Try again
            </button>
          </div>
        </main>
      </body>
    </html>
  );
}
