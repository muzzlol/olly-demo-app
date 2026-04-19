// In-memory 5xx counter for the demo worker. Lives at module scope so it is
// shared across requests inside a single isolate. Accuracy is not the point —
// a fresh isolate (after a cold start) starts at 0, which is fine for a visual
// demo signal.

const WINDOW_MS = 30_000;

const hits: number[] = [];

export function recordStatus(status: number): void {
  if (status < 500) return;
  hits.push(Date.now());
  prune(Date.now());
}

export function getRate(windowMs: number = WINDOW_MS): number {
  prune(Date.now());
  const cutoff = Date.now() - windowMs;
  return hits.reduce((n, t) => (t >= cutoff ? n + 1 : n), 0);
}

export function getWindowMs(): number {
  return WINDOW_MS;
}

function prune(now: number): void {
  const cutoff = now - WINDOW_MS;
  while (hits.length > 0 && hits[0]! < cutoff) {
    hits.shift();
  }
}
