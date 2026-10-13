import { Button } from "@/components/ui/Button";
import { Logo } from "@/components/ui/Logo";

// Temporary until the Home page lands (milestone M7).
export default function Home() {
  return (
    <main style={{ minHeight: "100dvh", display: "grid", placeItems: "center", padding: "var(--space-6) var(--gutter)" }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "var(--space-4)", textAlign: "center" }}>
        <Logo variant="large" width={200} />
        <p className="tagline">Matcha, With Taste.</p>
        <p className="body">The storefront is being built.</p>
        {process.env.NODE_ENV !== "production" ? (
          <Button href="/dev/components" variant="secondary" size="md">
            Component sheet
          </Button>
        ) : null}
      </div>
    </main>
  );
}
