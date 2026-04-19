import { createServerFn } from "@tanstack/react-start";

import { getRate, getWindowMs } from "./health";

export const RED_THRESHOLD = 3;

export interface HealthSnapshot {
  readonly rate: number;
  readonly windowMs: number;
  readonly threshold: number;
  readonly status: "green" | "red";
}

export const getHealth = createServerFn({ method: "GET" }).handler(
  (): HealthSnapshot => {
    const windowMs = getWindowMs();
    const rate = getRate(windowMs);
    return {
      rate,
      windowMs,
      threshold: RED_THRESHOLD,
      status: rate >= RED_THRESHOLD ? "red" : "green",
    };
  },
);
