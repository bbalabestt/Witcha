import { Skeleton } from "@/components/ui/Frame";

/** Generic page skeleton: a header band and a text block, matching the content-page layout. */
export default function Loading() {
  return (
    <div aria-busy="true" aria-label="Loading">
      <div style={{ background: "var(--surface-brand)" }}>
        <div className="container" style={{ paddingBlock: "clamp(40px, 6vw, 64px) 48px", display: "grid", gap: "var(--space-3)" }}>
          <Skeleton width={120} height={16} />
          <Skeleton width="min(520px, 80%)" height={44} />
          <Skeleton width="min(560px, 90%)" height={56} />
        </div>
      </div>
      <div className="container" style={{ paddingBlock: "32px 64px", display: "grid", gap: "var(--space-3)" }}>
        <Skeleton height={22} />
        <Skeleton width="80%" height={22} />
        <Skeleton width="60%" height={22} />
      </div>
    </div>
  );
}
