import {
  createStartHandler,
  defaultStreamHandler,
} from "@tanstack/react-start/server";
import type { Register } from "@tanstack/react-router";
import type { RequestHandler } from "@tanstack/react-start/server";

import { recordStatus } from "./lib/health";

const innerFetch = createStartHandler(defaultStreamHandler);

export type ServerEntry = { fetch: RequestHandler<Register> };

export function createServerEntry(entry: ServerEntry): ServerEntry {
  return {
    async fetch(request, opts) {
      const response = await entry.fetch(request, opts);
      recordStatus(response.status);
      return response;
    },
  };
}

export default createServerEntry({ fetch: innerFetch });
