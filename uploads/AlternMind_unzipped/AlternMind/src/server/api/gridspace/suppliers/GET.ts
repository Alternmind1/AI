/**
 * GET /api/gridspace/suppliers
 * Raw mysql2 — avoids Drizzle schema mismatch on live DB.
 */
import type { Request, Response } from 'express';
import mysql from 'mysql2/promise';
import { getDatabaseCredentials } from '../../../db/config.js';
import { requireGridspaceAuth } from '../../../lib/gridspaceAuth.js';

async function getConn() {
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

    const {
      q = '',
      type,
      productType,
      country,
      city,
      maxLeadDays,
      page = '1',
      limit = '20',
    } = req.query as Record<string, string>;

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 20));
    const offset = (pageNum - 1) * limitNum;

    const conn = await getConn();
    try {
      // Fetch all companies (filter in JS to avoid complex dynamic SQL)
      const [allCompanies] = await conn.execute(
        `SELECT * FROM gs_company ORDER BY created_at DESC`
      ) as [mysql.RowDataPacket[], mysql.FieldPacket[]];

      // Apply type filter
      let companies = allCompanies;
      if (type && ['manufacturer', 'warehouse', 'transport'].includes(type)) {
        companies = companies.filter((c) => c.company_type === type);
      }

      // Exclude requesting user's own companies
      if (!auth.isService && auth.userId) {
        companies = companies.filter((c) => c.user_id !== auth.userId);
      }

      // Free-text filter
      if (q) {
        const lower = q.toLowerCase();
        companies = companies.filter(
          (c) =>
            (c.company_name ?? '').toLowerCase().includes(lower) ||
            (c.description ?? '').toLowerCase().includes(lower) ||
            (c.contact_email ?? '').toLowerCase().includes(lower),
        );
      }

      // Enrich with assets and apply asset-level filters
      const enriched = await Promise.all(
        companies.map(async (company) => {
          const id = company.id;
          const ctype = company.company_type;

          if (ctype === 'manufacturer') {
            const [rows] = await conn.execute(
              `SELECT * FROM gs_facility WHERE company_id = ?`, [id]
            ) as [mysql.RowDataPacket[], mysql.FieldPacket[]];
            let facilities = rows as mysql.RowDataPacket[];

            if (productType) {
              const pt = productType.toLowerCase();
              facilities = facilities.filter((f) =>
                (f.product_type ?? '').toLowerCase().includes(pt) ||
                (f.product_category ?? '').toLowerCase().includes(pt),
              );
            }
            if (country) facilities = facilities.filter((f) => (f.country ?? '').toLowerCase() === country.toLowerCase());
            if (city) facilities = facilities.filter((f) => (f.city ?? '').toLowerCase().includes(city.toLowerCase()));
            if (maxLeadDays) {
              const max = parseInt(maxLeadDays, 10);
              facilities = facilities.filter((f) => f.lead_time_days !== null && f.lead_time_days <= max);
            }

            if (facilities.length === 0 && (productType || country || city || maxLeadDays)) return null;

            return {
              id: company.id,
              companyName: company.company_name,
              companyType: company.company_type,
              contactEmail: company.contact_email,
              description: company.description,
              facilities: facilities.map((f) => ({
                id: f.id,
                facilityName: f.facility_name,
                city: f.city,
                country: f.country,
                productType: f.product_type,
                productionCapacityUnits: f.production_capacity_units,
                capacityPeriod: f.capacity_period,
                unitCost: f.unit_cost,
                currency: f.currency,
                leadTimeDays: f.lead_time_days,
              })),
              warehouses: [],
              transports: [],
            };
          }

          if (ctype === 'warehouse') {
            const [rows] = await conn.execute(
              `SELECT * FROM gs_warehouse WHERE company_id = ?`, [id]
            ) as [mysql.RowDataPacket[], mysql.FieldPacket[]];
            let warehouses = rows as mysql.RowDataPacket[];

            if (country) warehouses = warehouses.filter((w) => (w.country ?? '').toLowerCase() === country.toLowerCase());
            if (city) warehouses = warehouses.filter((w) => (w.city ?? '').toLowerCase().includes(city.toLowerCase()));
            if (warehouses.length === 0 && (country || city)) return null;

            return {
              id: company.id,
              companyName: company.company_name,
              companyType: company.company_type,
              contactEmail: company.contact_email,
              description: company.description,
              facilities: [],
              warehouses,
              transports: [],
            };
          }

          if (ctype === 'transport') {
            const [rows] = await conn.execute(
              `SELECT * FROM gs_transport WHERE company_id = ?`, [id]
            ) as [mysql.RowDataPacket[], mysql.FieldPacket[]];
            let transports = rows as mysql.RowDataPacket[];

            if (country) {
              transports = transports.filter(
                (t) =>
                  (t.origin_country ?? '').toLowerCase() === country.toLowerCase() ||
                  (t.destination_country ?? '').toLowerCase() === country.toLowerCase(),
              );
            }
            if (city) {
              transports = transports.filter(
                (t) =>
                  (t.origin_city ?? '').toLowerCase().includes(city.toLowerCase()) ||
                  (t.destination_city ?? '').toLowerCase().includes(city.toLowerCase()),
              );
            }
            if (transports.length === 0 && (country || city)) return null;

            return {
              id: company.id,
              companyName: company.company_name,
              companyType: company.company_type,
              contactEmail: company.contact_email,
              description: company.description,
              facilities: [],
              warehouses: [],
              transports,
            };
          }

          return {
            id: company.id,
            companyName: company.company_name,
            companyType: company.company_type,
            contactEmail: company.contact_email,
            description: company.description,
            facilities: [],
            warehouses: [],
            transports: [],
          };
        }),
      );

      const results = enriched.filter(Boolean);
      const total = results.length;
      const paginated = results.slice(offset, offset + limitNum);

      res.json({
        results: paginated,
        pagination: { total, page: pageNum, limit: limitNum, pages: Math.ceil(total / limitNum) },
      });
    } finally {
      await conn.end();
    }
  } catch (error) {
    console.error('[gridspace/suppliers GET]', error);
    res.status(500).json({ error: 'Supplier search failed', message: String(error) });
  }
}
