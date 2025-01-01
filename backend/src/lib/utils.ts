import type { StatusCode } from "hono/utils/http-status";

export class ApiError extends Error {
  statusCode: StatusCode;

  constructor(message: string, statusCode: StatusCode) {
    super(message);
    this.statusCode = statusCode;
    this.name = "Api Error"
  }
}

export function isUniqueConstraintError(err: any): boolean {
  return err && typeof err === "object" && "code" in err && err.code === "23505";
}