import Link from "next/link";

/** Root fallback (outside the shop layout); shop URLs use (shop)/not-found. */
export default function RootNotFound() {
  return (
    <main style={{ minHeight: "60dvh", display: "grid", placeItems: "center", padding: "var(--space-6) var(--gutter)", textAlign: "center" }}>
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
        <h1 className="heading-1">This page wandered off.</h1>
        <p>
          <Link href="/">Back to WITCHA MATCHA</Link>
        </p>
      </div>
    </main>
  );
}
