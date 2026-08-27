import type { Request, Response } from 'express';
import { requireGridspaceAuth } from '../../../../lib/gridspaceAuth.js';
import mysql from 'mysql2/promise';
import { getDatabaseCredentials } from '../../../../db/config.js';

async function getRawConnection() {
  const cfg = getDatabaseCredentials();
  return mysql.createConnection({
    host: cfg.host, port: cfg.port, user: cfg.user,
    password: cfg.password, database: cfg.database,
    ssl: { rejectUnauthorized: false },
  });
}

export default async function handler(req: Request, res: Response) {
  try {
    const auth = await requireGridspaceAuth(req, res);
    if (!auth) return;

    const id = parseInt(String(req.params.id), 10);
    if (isNaN(id)) return res.status(400).json({ error: 'Invalid company id' });

    const conn = await getRawConnection();
    try {
      const [companies] = await conn.execute(
        `SELECT * FROM gs_company WHERE id = ? LIMIT 1`, [id]
      ) as [mysql.RowDataPacket[], mysql.FieldPacket[]];

      if (!companies.length) return res.status(404).json({ error: 'Company not found' });
      const company = companies[0];

      const [[facilities], [warehouses], [transports]] = await Promise.all([
        conn.execute(`SELECT * FROM gs_facility WHERE company_id = ?`, [id]),
        conn.execute(`SELECT * FROM gs_warehouse WHERE company_id = ?`, [id]),
        conn.execute(`SELECT * FROM gs_transport WHERE company_id = ?`, [id]),
      ]) as [[mysql.RowDataPacket[], mysql.FieldPacket[]], [mysql.RowDataPacket[], mysql.FieldPacket[]], [mysql.RowDataPacket[], mysql.FieldPacket[]]];

      res.json({
        id: company.id,
        companyName: company.company_name,
        companyType: company.company_type,
        registrationNumber: company.registration_number,
        contactEmail: company.contact_email,
        contactPhone: company.contact_phone,
        website: company.website,
        description: company.description,
        imageUrl: company.image_url ?? null,
        isActive: company.is_active,
        createdAt: company.created_at,
        facilities,
        warehouses,
        transports,
      });
    } finally {
      await conn.end();
    }
  } catch (error) {
    console.error('[gridspace/companies/:id GET]', error);
    res.status(500).json({ error: 'Failed to fetch company', message: String(error) });
  }
}
