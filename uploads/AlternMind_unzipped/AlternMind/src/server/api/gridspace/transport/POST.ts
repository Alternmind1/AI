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

    const {
      companyId, routeName, routeCode,
      originCity, originCountry, destinationCity, destinationCountry,
      transportMode, vehicleType,
      capacityUnits, capacityWeightKg, capacityVolumeCbm,
      costPerUnit, costPerKg, currency, transitTimeDays, frequency,
      certifications, notes, imageUrl,
    } = req.body;

    if (!companyId || !routeName || !originCity || !originCountry || !destinationCity || !destinationCountry || !transportMode || !transitTimeDays) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const conn = await getRawConnection();
    let insertId: number;

    try {
      // Verify company ownership
      const [companies] = await conn.execute(
        auth.isService
          ? `SELECT id FROM gs_company WHERE id = ? LIMIT 1`
          : `SELECT id FROM gs_company WHERE id = ? AND user_id = ? LIMIT 1`,
        auth.isService ? [Number(companyId)] : [Number(companyId), auth.userId]
      ) as [mysql.RowDataPacket[], mysql.FieldPacket[]];

      if (!companies.length) return res.status(403).json({ error: 'Company not found or access denied' });

      // Check if image_url column exists
      const [cols] = await conn.execute(
        `SHOW COLUMNS FROM gs_transport LIKE 'image_url'`
      ) as [mysql.RowDataPacket[], mysql.FieldPacket[]];
      const hasImageUrl = cols.length > 0;

      const certsJson = certifications ? JSON.stringify(certifications) : null;

      if (hasImageUrl) {
        const [result] = await conn.execute(
          `INSERT INTO gs_transport
            (company_id, route_name, route_code, origin_city, origin_country,
             destination_city, destination_country, transport_mode, vehicle_type,
             capacity_units, capacity_weight_kg, capacity_volume_cbm,
             cost_per_unit, cost_per_kg, currency, transit_time_days,
             frequency, certifications, notes, image_url)
           VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
          [
            Number(companyId), routeName, routeCode || null,
            originCity, originCountry, destinationCity, destinationCountry,
            transportMode, vehicleType || null,
            capacityUnits ? Number(capacityUnits) : null,
            capacityWeightKg ? String(capacityWeightKg) : null,
            capacityVolumeCbm ? String(capacityVolumeCbm) : null,
            costPerUnit ? String(costPerUnit) : null,
            costPerKg ? String(costPerKg) : null,
            currency || 'USD', String(transitTimeDays),
            frequency || null, certsJson, notes || null, imageUrl || null,
          ]
        ) as [mysql.ResultSetHeader, mysql.FieldPacket[]];
        insertId = result.insertId;
      } else {
        const [result] = await conn.execute(
          `INSERT INTO gs_transport
            (company_id, route_name, route_code, origin_city, origin_country,
             destination_city, destination_country, transport_mode, vehicle_type,
             capacity_units, capacity_weight_kg, capacity_volume_cbm,
             cost_per_unit, cost_per_kg, currency, transit_time_days,
             frequency, certifications, notes)
           VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
          [
            Number(companyId), routeName, routeCode || null,
            originCity, originCountry, destinationCity, destinationCountry,
            transportMode, vehicleType || null,
            capacityUnits ? Number(capacityUnits) : null,
            capacityWeightKg ? String(capacityWeightKg) : null,
            capacityVolumeCbm ? String(capacityVolumeCbm) : null,
            costPerUnit ? String(costPerUnit) : null,
            costPerKg ? String(costPerKg) : null,
            currency || 'USD', String(transitTimeDays),
            frequency || null, certsJson, notes || null,
          ]
        ) as [mysql.ResultSetHeader, mysql.FieldPacket[]];
        insertId = result.insertId;
      }

      const [rows] = await conn.execute(
        `SELECT * FROM gs_transport WHERE id = ? LIMIT 1`, [insertId]
      ) as [mysql.RowDataPacket[], mysql.FieldPacket[]];

      res.status(201).json(rows[0] ?? { insertId });
    } finally {
      await conn.end();
    }
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    const stack = error instanceof Error ? error.stack : '';
    console.error('[gridspace/transport POST] ERROR:', msg);
    console.error('[gridspace/transport POST] STACK:', stack);
    res.status(500).json({ error: 'Failed to create transport route', message: msg, detail: stack?.split('\n')[1] ?? '' });
  }
}
