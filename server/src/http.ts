import { NextFunction, Request, RequestHandler, Response } from "express";

export function sendError(res: Response, status: number, message: string) {
  return res.status(status).json({ error: message });
}

export const badRequest = (res: Response, message = "missing fields") => sendError(res, 400, message);
export const unauthorized = (res: Response, message = "invalid credentials") => sendError(res, 401, message);
export const notFound = (res: Response, message = "not found") => sendError(res, 404, message);

/** Wraps an async route handler so rejected promises reach the express error handler. */
export function asyncHandler(handler: (req: Request, res: Response, next: NextFunction) => Promise<unknown>): RequestHandler {
  return (req, res, next) => {
    handler(req, res, next).catch(next);
  };
}
