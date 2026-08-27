/**
 * POST /api/gridspace/upload
 * Accepts a base64-encoded image and saves it to persistent storage.
 * Returns a public URL.
 *
 * Body: { dataUrl: string, filename: string }
 */
import type { Request, Response } from 'express';
import { requireGridspaceAuth } from '../../../lib/gridspaceAuth.js';
import { writeFile, mkdir } from 'node:fs/promises';
import { join } from 'node:path';
import { randomUUID } from 'node:crypto';

const ALLOWED_TYPES: Record<string, string> = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'image/gif': '.gif',
};

export default async function handler(req: Request, res: Response) {
  try {
    const auth = await requireGridspaceAuth(req, res);
    if (!auth) return;

    const { dataUrl } = req.body as { dataUrl?: string; filename?: string };
    if (!dataUrl || !dataUrl.startsWith('data:')) {
      return res.status(400).json({ error: 'dataUrl is required and must be a data URI' });
    }

    // Parse data URI: data:<mime>;base64,<data>
    const match = dataUrl.match(/^data:([^;]+);base64,(.+)$/);
    if (!match) return res.status(400).json({ error: 'Invalid data URI format' });

    const mimeType = match[1];
    const base64Data = match[2];
    const ext = ALLOWED_TYPES[mimeType];
    if (!ext) {
      return res.status(400).json({ error: `Unsupported image type: ${mimeType}. Allowed: jpeg, png, webp, gif` });
    }

    // Limit to 5 MB
    const buffer = Buffer.from(base64Data, 'base64');
    if (buffer.byteLength > 5 * 1024 * 1024) {
      return res.status(400).json({ error: 'Image must be under 5 MB' });
    }

    const safeFilename = `${randomUUID()}${ext}`;
    const uploadDir = '/shared-storage/public/assets/uploads/gridspace';
    await mkdir(uploadDir, { recursive: true });
    await writeFile(join(uploadDir, safeFilename), buffer);

    const url = `/airo-assets/uploads/gridspace/${safeFilename}`;
    res.json({ url });
  } catch (error) {
    res.status(500).json({ error: 'Upload failed', message: String(error) });
  }
}
