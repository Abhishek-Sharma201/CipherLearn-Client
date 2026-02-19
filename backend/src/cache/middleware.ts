import { Request, Response, NextFunction } from "express";
import { cacheService } from "./index";

/**
 * Express middleware factory for route-level response caching.
 * Not wired to any routes initially — service-level getOrSet is the primary strategy.
 */
export function cacheMiddleware(keyFn: (req: Request) => string, ttl: number) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const key = keyFn(req);
    const cached = cacheService.get<{ status: number; body: unknown }>(key);

    if (cached) {
      res.status(cached.status).json(cached.body);
      return;
    }

    // Capture the original json method
    const originalJson = res.json.bind(res);

    res.json = (body: unknown) => {
      // Only cache successful responses
      if (res.statusCode >= 200 && res.statusCode < 300) {
        cacheService.set(key, { status: res.statusCode, body }, ttl);
      }
      return originalJson(body);
    };

    next();
  };
}
