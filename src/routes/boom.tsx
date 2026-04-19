import { createFileRoute } from "@tanstack/react-router";
import { createLogger } from "@/lib/log";
import { computeTotal, demoCart } from "@/lib/price";

const log = createLogger("demo", { route: "/boom" });

export const Route = createFileRoute("/boom")({
  server: {
    handlers: {
      GET: async () => {
        // We catch once here so the wide event carries the full stack and
        // workspace context before the framework renders its generic 500.
        // The error is rethrown so the response status stays 500 and the
        // module-scope `recordStatus` wrap (src/server.ts) counts it.
        try {
          const cart = demoCart();
          const total = computeTotal(cart);
          log.info("demo.boom_ok", { total, items: cart.length });
          return Response.json({ total });
        } catch (err) {
          const error = err as Error;
          log.error("demo.boom_failed", {
            error,
            message: error.message,
            name: error.name,
            stack: error.stack,
          });
          throw err;
        }
      },
    },
  },
});
