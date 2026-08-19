import { NextFunction, Request, RequestHandler, Response } from "express";

export class HttpError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "HttpError";
    this.status = status;
  }
}

/**
 * Wraps an async handler so a rejected promise reaches the error middleware
 * instead of being silently dropped by Express 4.
 */
export function asyncHandler(handler: RequestHandler): RequestHandler {
  return (req, res, next) => {
    Promise.resolve(handler(req, res, next)).catch(next);
  };
}

export function notFoundHandler(_req: Request, _res: Response, next: NextFunction): void {
  next(new HttpError(404, "not found"));
}

/**
 * Status of errors raised by middleware such as body-parser, which mark the
 * request (not the server) as faulty and expose a safe message.
 */
function clientErrorStatus(err: unknown): number | undefined {
  if (!(err instanceof Error)) return undefined;
  const candidate = err as Error & { status?: unknown; expose?: unknown };
  if (candidate.expose !== true) return undefined;
  const status = candidate.status;
  return typeof status === "number" && status >= 400 && status < 500 ? status : undefined;
}

export function errorHandler(err: unknown, _req: Request, res: Response, next: NextFunction): void {
  if (res.headersSent) {
    next(err);
    return;
  }

  const status = err instanceof HttpError ? err.status : clientErrorStatus(err);
  if (status) {
    if (status >= 500) console.error(err);
    res.status(status).json({ error: (err as Error).message });
    return;
  }

  console.error("unhandled error while serving request", err);
  res.status(500).json({ error: "internal server error" });
}
