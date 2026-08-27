import type { Request, Response } from 'express';
import { requireGridspaceAuth } from '../../../lib/gridspaceAuth.js';
import mysql from 'mysql2/promise';
import { getDatabaseCredentials } from '../../../db/config.js';

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

    const conn = await getRawConnection();
    try {
      // Fetch companies — service gets all, users get their own
      const [companies] = await conn.execute(
        auth.isService
          ? `SELECT * FROM gs_company ORDER BY created_at DESC`
          : `SELECT * FROM gs_company WHERE user_id = ? ORDER BY created_at DESC`,
        auth.isService ? [] : [auth.userId]
      ) as [mysql.RowDataPacket[], mysql.FieldPacket[]];

      // Fetch related assets for each company
      const result = await Promise.all(
        companies.map(async (company) => {
          const type = company.company_type;
          const id = company.id;

          const [facilities] = type === 'manufacturer'
            ? await conn.execute(`SELECT * FROM gs_facility WHERE company_id = ?`, [id]) as [mysql.RowDataPacket[], mysql.FieldPacket[]]
            : [[] as mysql.RowDataPacket[]];

          const [warehouses] = type === 'warehouse'
            ? await conn.execute(`SELECT * FROM gs_warehouse WHERE company_id = ?`, [id]) as [mysql.RowDataPacket[], mysql.FieldPacket[]]
            : [[] as mysql.RowDataPacket[]];

          const [transports] = type === 'transport'
            ? await conn.execute(`SELECT * FROM gs_transport WHERE company_id = ?`, [id]) as [mysql.RowDataPacket[], mysql.FieldPacket[]]
            : [[] as mysql.RowDataPacket[]];

          // Normalise snake_case DB columns to camelCase for the frontend
          return {
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
          };
        })
      );

      res.json(result);
    } finally {
      await conn.end();
    }
  } catch (error) {
    console.error('[gridspace/companies GET]', error);
    res.status(500).json({ error: 'Failed to fetch companies', message: String(error) });
  }
}
