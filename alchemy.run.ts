import alchemy from "alchemy";
import { D1Database, R2Bucket, TanStackStart } from "alchemy/cloudflare";

const app = await alchemy("demo");

const r2 = await R2Bucket("r2", { adopt: true });

const db = await D1Database("waitlist-db", {
  name: "olly-demo-waitlist",
  migrationsDir: "./migrations",
  adopt: true,
});

// Tail consumer: point the demo worker's logs at the root olly-tail worker.
// Referenced by deployed service name so this repo stays independent of the
// root monorepo. Set OLLY_TAIL_SERVICE="none" (or empty) to deploy without a
// tail consumer (useful when olly-tail hasn't been deployed yet).
const tailRaw = process.env.OLLY_TAIL_SERVICE ?? "olly-tail";
const tailService =
  tailRaw && tailRaw !== "none" && tailRaw.trim().length > 0 ? tailRaw : null;

export const website = await TanStackStart("website", {
  adopt: true,
  bindings: {
    R2: r2,
    DB: db,
  },
  ...(tailService ? { tailConsumers: [{ service: tailService }] } : {}),
});

console.log("\n  URLs");
console.log(`    demo       ${website.url ?? "(no url)"}`);
console.log(`    tail -> ${tailService ?? "(disabled)"}\n`);

await app.finalize();
