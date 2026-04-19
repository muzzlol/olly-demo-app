import { createFileRoute } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { env } from "cloudflare:workers";
import { getRequest } from "@tanstack/react-start/server";
import { useState } from "react";
import { toast } from "sonner";
import { ArrowRight, Clock, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type JoinResult =
  | { ok: true; already: boolean }
  | { ok: false; error: string };

const joinWaitlist = createServerFn({ method: "POST" })
  .inputValidator((raw: unknown): { email: string } => {
    if (!raw || typeof raw !== "object") throw new Error("invalid payload");
    const email = (raw as { email?: unknown }).email;
    if (typeof email !== "string") throw new Error("email required");
    const trimmed = email.trim().toLowerCase();
    if (!EMAIL.test(trimmed)) throw new Error("enter a valid email");
    if (trimmed.length > 254) throw new Error("email too long");
    return { email: trimmed };
  })
  .handler(async ({ data }): Promise<JoinResult> => {
    const ua = getRequest().headers.get("user-agent") ?? null;
    const existing = await env.DB.prepare(
      "SELECT 1 FROM waitlist WHERE email = ?",
    )
      .bind(data.email)
      .first();
    if (existing) return { ok: true, already: true };

    await env.DB.prepare(
      "INSERT INTO waitlist (email, source, user_agent) VALUES (?, ?, ?)",
    )
      .bind(data.email, "landing", ua)
      .run();

    console.log(
      JSON.stringify({
        event: "waitlist.joined",
        email_hash: hash(data.email),
        ts: Date.now(),
      }),
    );

    return { ok: true, already: false };
  });

function hash(s: string) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0).toString(16);
}

export const Route = createFileRoute("/")({
  component: Landing,
});

function Landing() {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    const result = await joinWaitlist({ data: { email } }).catch(
      (err: Error) => ({ ok: false as const, error: err.message }),
    );
    setSubmitting(false);
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    setDone(true);
    toast.success(
      result.already ? "already on the list" : "you're on the list",
      {
        description: "we'll email you right before the live demo kicks off.",
      },
    );
    setEmail("");
  }

  return (
    <main className="relative isolate min-h-screen overflow-hidden">
      <GridBackdrop />
      <section className="relative z-10 mx-auto flex min-h-screen max-w-3xl flex-col items-center justify-center px-6 pt-24 pb-16 text-center">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border/60 bg-card/40 px-3 py-1 text-xs text-muted-foreground backdrop-blur">
          <Clock className="h-3 w-3" />
          live demo · <span className="text-foreground">5:00 PM IST</span>
        </div>

        <h1 className="text-balance bg-gradient-to-b from-foreground to-foreground/60 bg-clip-text text-5xl font-semibold tracking-tight text-transparent sm:text-6xl md:text-7xl">
          olly fixes the bug
          <br />
          before you see the alert.
        </h1>

        <p className="mt-6 max-w-xl text-balance text-base text-muted-foreground sm:text-lg">
          an autonomous SRE that watches your logs, finds the regression, opens
          the PR. tune in at <span className="text-foreground">5pm IST</span>{" "}
          for a live demo where olly ships a fix to a production bug in real
          time.
        </p>

        <form
          onSubmit={onSubmit}
          className="mt-10 flex w-full max-w-md flex-col gap-3 sm:flex-row"
        >
          <Input
            type="email"
            required
            autoComplete="email"
            placeholder="you@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={submitting || done}
            className="h-11 flex-1 bg-background/60 backdrop-blur"
          />
          <Button
            type="submit"
            size="lg"
            disabled={submitting || done || email.trim().length === 0}
            className="h-11"
          >
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                joining
              </>
            ) : done ? (
              "you're in"
            ) : (
              <>
                join waitlist
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </Button>
        </form>

        <p className="mt-4 text-xs text-muted-foreground">
          no spam. one email with the livestream link. unsubscribe anytime.
        </p>

        <div className="mt-20 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-xs text-muted-foreground">
          <Feature label="log → incident in seconds" />
          <Feature label="clones your repo, reads the stack" />
          <Feature label="opens a PR you review" />
        </div>
      </section>
    </main>
  );
}

function Feature({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_10px] shadow-emerald-400/60" />
      {label}
    </div>
  );
}

function GridBackdrop() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 -z-10"
      style={{
        backgroundImage:
          "radial-gradient(60% 50% at 50% 10%, oklch(0.25 0 0 / 0.8) 0%, transparent 70%), linear-gradient(to right, oklch(1 0 0 / 0.05) 1px, transparent 1px), linear-gradient(to bottom, oklch(1 0 0 / 0.05) 1px, transparent 1px)",
        backgroundSize: "100% 100%, 40px 40px, 40px 40px",
      }}
    />
  );
}
