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
      companyId, warehouseName, warehouseCode,
      addressLine1, addressLine2, city, stateProvince, country, postalCode, latitude, longitude,
      totalCapacityCbm, availableCapacityCbm, storageTypes,
      costPerCbmPerDay, currency, handlingCapacityUnitsPerDay, certifications, notes, imageUrl,
    } = req.body;

    if (!companyId || !warehouseName || !addressLine1 || !city || !country || !totalCapacityCbm) {
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
        `SHOW COLUMNS FROM gs_warehouse LIKE 'image_url'`
      ) as [mysql.RowDataPacket[], mysql.FieldPacket[]];
      const hasImageUrl = cols.length > 0;

      const certsJson = certifications ? JSON.stringify(certifications) : null;
      const storageTypesJson = storageTypes ? JSON.stringify(storageTypes) : null;

      if (hasImageUrl) {
        const [result] = await conn.execute(
          `INSERT INTO gs_warehouse
            (company_id, warehouse_name, warehouse_code,
             address_line1, address_line2, city, state_province, country, postal_code, latitude, longitude,
             total_capacity_cbm, available_capacity_cbm, storage_types,
             cost_per_cbm_per_day, currency, handling_capacity_units_per_day,
             certifications, notes, image_url)
           VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
          [
            Number(companyId), warehouseName, warehouseCode || null,
            addressLine1, addressLine2 || null, city,
            stateProvince || null, country, postalCode || null,
            latitude ? String(latitude) : null, longitude ? String(longitude) : null,
            String(totalCapacityCbm),
            availableCapacityCbm ? String(availableCapacityCbm) : null,
            storageTypesJson,
            costPerCbmPerDay ? String(costPerCbmPerDay) : null,
            currency || 'USD',
            handlingCapacityUnitsPerDay ? Number(handlingCapacityUnitsPerDay) : null,
            certsJson, notes || null, imageUrl || null,
          ]
        ) as [mysql.ResultSetHeader, mysql.FieldPacket[]];
        insertId = result.insertId;
      } else {
        const [result] = await conn.execute(
          `INSERT INTO gs_warehouse
            (company_id, warehouse_name, warehouse_code,
             address_line1, address_line2, city, state_province, country, postal_code, latitude, longitude,
             total_capacity_cbm, available_capacity_cbm, storage_types,
             cost_per_cbm_per_day, currency, handling_capacity_units_per_day,
             certifications, notes)
           VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
          [
            Number(companyId), warehouseName, warehouseCode || null,
            addressLine1, addressLine2 || null, city,
            stateProvince || null, country, postalCode || null,
            latitude ? String(latitude) : null, longitude ? String(longitude) : null,
            String(totalCapacityCbm),
            availableCapacityCbm ? String(availableCapacityCbm) : null,
            storageTypesJson,
            costPerCbmPerDay ? String(costPerCbmPerDay) : null,
            currency || 'USD',
            handlingCapacityUnitsPerDay ? Number(handlingCapacityUnitsPerDay) : null,
            certsJson, notes || null,
          ]
        ) as [mysql.ResultSetHeader, mysql.FieldPacket[]];
        insertId = result.insertId;
      }

      const [rows] = await conn.execute(
        `SELECT * FROM gs_warehouse WHERE id = ? LIMIT 1`, [insertId]
      ) as [mysql.RowDataPacket[], mysql.FieldPacket[]];

      res.status(201).json(rows[0] ?? { insertId });
    } finally {
      await conn.end();
    }
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error('[gridspace/warehouses POST] ERROR:', msg);
    res.status(500).json({ error: 'Failed to create warehouse', message: msg });
  }
}
