// server/src/middleware/errorHandler.ts
import { Request, Response, NextFunction } from "express"
import { logger } from "../lib/logger"
import { env } from "../config/env"

export interface AppError extends Error {
  statusCode?: number
  expose?: boolean
}

export function errorHandler(
  err: AppError,
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  const statusCode = err.statusCode ?? 500
  const message =
    err.expose || statusCode < 500
      ? err.message
      : "An unexpected error occurred"

  if (statusCode >= 500) {
    logger.error({ err, req: { method: req.method, url: req.url } }, "server error")
  }

  res.status(statusCode).json({
    error: message,
    requestId: req.requestId,
    ...(env.NODE_ENV === "development" && statusCode >= 500 ? { stack: err.stack } : {}),
  })
}

export function createError(message: string, statusCode = 400): AppError {
  const err = new Error(message) as AppError
  err.statusCode = statusCode
  err.expose = statusCode < 500
  return err
}
