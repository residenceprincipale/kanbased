import type { StatusCode } from "hono/utils/http-status";

export class ApiError extends Error {
  statusCode: StatusCode;

  constructor(message: string, statusCode: StatusCode) {
    super(message);
    this.statusCode = statusCode;
    this.name = "Api Error"
  }
}
