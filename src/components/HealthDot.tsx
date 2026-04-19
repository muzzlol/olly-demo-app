import { useEffect, useState } from "react";

import { getHealth, type HealthSnapshot } from "@/lib/get-health";

const POLL_MS = 3000;

export default function HealthDot() {
  const [snap, setSnap] = useState<HealthSnapshot | null>(null);

  useEffect(() => {
    let alive = true;

    async function tick() {
      const result = await getHealth().catch(() => null);
      if (alive && result) setSnap(result);
    }

    tick();
    const id = setInterval(tick, POLL_MS);
    return () => {
      alive = false;
      clearInterval(id);
    };
  }, []);

  const status = snap?.status ?? "green";
  const rate = snap?.rate ?? 0;
  const windowSec = Math.round((snap?.windowMs ?? 30_000) / 1000);
  const threshold = snap?.threshold ?? 3;

  const color =
    status === "red"
      ? "bg-red-500 shadow-[0_0_10px] shadow-red-500/70"
      : "bg-emerald-400 shadow-[0_0_10px] shadow-emerald-400/60";

  const tooltip = `${rate} 5xx in last ${windowSec}s (threshold ${threshold})`;

  return (
    <span
      title={tooltip}
      aria-label={`health: ${status}, ${tooltip}`}
      className="inline-flex items-center gap-2 text-xs text-muted-foreground"
    >
      <span className={`h-2 w-2 rounded-full transition-colors ${color}`} />
      <span className="hidden sm:inline">{status}</span>
    </span>
  );
}
