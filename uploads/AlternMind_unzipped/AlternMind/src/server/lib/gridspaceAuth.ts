/**
 * GridSpace auth helper.
 *
 * Accepts two authentication paths:
 *   1. BetterAuth session cookie  — browser / dashboard users
 *   2. Bearer token               — Python optimization backend (OPTIMIZER_API_SECRET)
 *
 * Usage in a route handler:
 *
 *   const authResult = await requireGridspaceAuth(req, res);
 *   if (!authResult) return; // response already sent
 *   const { userId, isService } = authResult;
 */

import type { Request, Response } from 'express';
import { getSecret } from '#airo/secrets';
import { getAuth } from '../../lib/auth/auth.js';

export type GridspaceAuthResult =
  | { isService: true; userId: null }
  | { isService: false; userId: string };

export async function requireGridspaceAuth(
  req: Request,
  res: Response,
): Promise<GridspaceAuthResult | null> {
  // --- Path 1: service-to-service bearer token ---
  const authHeader = req.headers['authorization'] ?? '';
  if (authHeader.startsWith('Bearer ')) {
    const token = authHeader.slice(7).trim();
    const secret = getSecret('OPTIMIZER_API_SECRET');

    if (!secret) {
      // Secret not configured yet — reject rather than allow anything through
      res.status(503).json({
        error: 'Service auth not configured',
        message: 'OPTIMIZER_API_SECRET is not set on this server.',
      });
      return null;
    }

    if (token !== secret) {
      res.status(401).json({ error: 'Invalid service token' });
      return null;
    }

    return { isService: true, userId: null };
  }

  // --- Path 2: BetterAuth session cookie ---
  const auth = getAuth();
  const session = await auth.api.getSession({
    headers: req.headers as unknown as Headers,
  });

  if (!session?.user) {
    res.status(401).json({ error: 'Unauthorized' });
    return null;
  }

  return { isService: false, userId: session.user.id };
}
