import type { Request, Response } from 'express';
import { requireGridspaceAuth } from '../../../lib/gridspaceAuth.js';
import mysql from 'mysql2/promise';
import { getDatabaseCredentials } from '../../../db/config.js';

// Get a direct mysql2 connection to bypass Drizzle ORM schema assumptions
async function getRawConnection() {
  const cfg = getDatabaseCredentials();
  return mysql.createConnection({
    host: cfg.host,
    port: cfg.port,
    user: cfg.user,
    password: cfg.password,
    database: cfg.database,
    ssl: { rejectUnauthorized: false },
  });
}

export default async function handler(req: Request, res: Response) {
  try {
    const auth = await requireGridspaceAuth(req, res);
    if (!auth) return;

    const {
      companyName,
      companyType,
      registrationNumber,
      contactEmail,
      contactPhone,
      website,
      description,
      imageUrl,
    } = req.body;

    if (!companyName || !companyType || !contactEmail) {
      return res.status(400).json({ error: 'companyName, companyType, and contactEmail are required' });
    }
    if (!['manufacturer', 'warehouse', 'transport'].includes(companyType)) {
      return res.status(400).json({ error: 'companyType must be manufacturer, warehouse, or transport' });
    }

    const resolvedUserId = auth.isService ? req.body.userId : auth.userId;
    if (!resolvedUserId) return res.status(400).json({ error: 'userId is required for service requests' });

    const conn = await getRawConnection();
    let insertId: number;

    try {
      // Check if image_url column exists
      const [cols] = await conn.execute(
        `SHOW COLUMNS FROM gs_company LIKE 'image_url'`
      ) as [mysql.RowDataPacket[], mysql.FieldPacket[]];

      const hasImageUrl = cols.length > 0;

      if (hasImageUrl) {
        const [result] = await conn.execute(
          `INSERT INTO gs_company
            (user_id, company_name, company_type, registration_number, contact_email, contact_phone, website, description, image_url)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            resolvedUserId,
            companyName,
            companyType,
            registrationNumber || null,
            contactEmail,
            contactPhone || null,
            website || null,
            description || null,
            imageUrl || null,
          ]
        ) as [mysql.ResultSetHeader, mysql.FieldPacket[]];
        insertId = result.insertId;
      } else {
        const [result] = await conn.execute(
          `INSERT INTO gs_company
            (user_id, company_name, company_type, registration_number, contact_email, contact_phone, website, description)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            resolvedUserId,
            companyName,
            companyType,
            registrationNumber || null,
            contactEmail,
            contactPhone || null,
            website || null,
            description || null,
          ]
        ) as [mysql.ResultSetHeader, mysql.FieldPacket[]];
        insertId = result.insertId;
      }
    } finally {
      await conn.end();
    }

    if (!insertId) {
      return res.status(500).json({ error: 'Insert succeeded but no insertId returned' });
    }

    // Fetch the created company using raw SQL to avoid ORM schema mismatches
    const conn2 = await getRawConnection();
    let company: Record<string, unknown> | null = null;
    try {
      const [rows] = await conn2.execute(
        `SELECT * FROM gs_company WHERE id = ? LIMIT 1`,
        [insertId]
      ) as [mysql.RowDataPacket[], mysql.FieldPacket[]];
      company = rows[0] ?? null;
    } finally {
      await conn2.end();
    }

    if (!company) {
      return res.status(500).json({ error: 'Company created but could not be retrieved', insertId });
    }

    res.status(201).json(company);
  } catch (error) {
    console.error('[gridspace/companies POST]', error);
    res.status(500).json({ error: 'Failed to create company', message: String(error) });
  }
}
