import type { StatusCode } from "hono/utils/http-status";
import type { Context } from "./types.js";
import type { JSONValue } from "hono/utils/types";

export function sendJson<TContext extends Context, TData extends JSONValue, TStatus extends StatusCode>(
  c: TContext,
  data: TData,
  status: TStatus,
) {
  // @ts-ignore
  return c.json<TData, StatusCode>(data, status);
}

export function getUser(c: Context) {
  return c.var.user;
} 