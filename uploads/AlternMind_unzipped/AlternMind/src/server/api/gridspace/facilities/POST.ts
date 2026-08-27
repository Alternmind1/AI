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
      companyId, facilityName, facilityCode,
      addressLine1, addressLine2, city, stateProvince, country, postalCode, latitude, longitude,
      productType, productCategory, productionCapacityUnits, capacityPeriod,
      unitProductionTimeMinutes, unitCost, currency,
      hasStorage, storageCapacityUnits, storageCapacityVolumeCbm,
      minimumOrderQuantity, maximumOrderQuantity, leadTimeDays,
      operatingHoursStart, operatingHoursEnd, certifications, notes, imageUrl,
    } = req.body;

    if (!companyId || !facilityName || !addressLine1 || !city || !country || !productType ||
        !productionCapacityUnits || !unitProductionTimeMinutes || !unitCost) {
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
        `SHOW COLUMNS FROM gs_facility LIKE 'image_url'`
      ) as [mysql.RowDataPacket[], mysql.FieldPacket[]];
      const hasImageUrl = cols.length > 0;

      const certsJson = certifications ? JSON.stringify(certifications) : null;

      if (hasImageUrl) {
        const [result] = await conn.execute(
          `INSERT INTO gs_facility
            (company_id, facility_name, facility_code,
             address_line1, address_line2, city, state_province, country, postal_code, latitude, longitude,
             product_type, product_category, production_capacity_units, capacity_period,
             unit_production_time_minutes, unit_cost, currency,
             has_storage, storage_capacity_units, storage_capacity_volume_cbm,
             minimum_order_quantity, maximum_order_quantity, lead_time_days,
             operating_hours_start, operating_hours_end, certifications, notes, image_url)
           VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
          [
            Number(companyId), facilityName, facilityCode || null,
            addressLine1, addressLine2 || null, city,
            stateProvince || null, country, postalCode || null,
            latitude ? String(latitude) : null, longitude ? String(longitude) : null,
            productType, productCategory || null,
            Number(productionCapacityUnits), capacityPeriod || 'day',
            String(unitProductionTimeMinutes), String(unitCost), currency || 'USD',
            hasStorage ? 1 : 0,
            storageCapacityUnits ? Number(storageCapacityUnits) : null,
            storageCapacityVolumeCbm ? String(storageCapacityVolumeCbm) : null,
            minimumOrderQuantity ? Number(minimumOrderQuantity) : null,
            maximumOrderQuantity ? Number(maximumOrderQuantity) : null,
            leadTimeDays ? Number(leadTimeDays) : null,
            operatingHoursStart || null, operatingHoursEnd || null,
            certsJson, notes || null, imageUrl || null,
          ]
        ) as [mysql.ResultSetHeader, mysql.FieldPacket[]];
        insertId = result.insertId;
      } else {
        const [result] = await conn.execute(
          `INSERT INTO gs_facility
            (company_id, facility_name, facility_code,
             address_line1, address_line2, city, state_province, country, postal_code, latitude, longitude,
             product_type, product_category, production_capacity_units, capacity_period,
             unit_production_time_minutes, unit_cost, currency,
             has_storage, storage_capacity_units, storage_capacity_volume_cbm,
             minimum_order_quantity, maximum_order_quantity, lead_time_days,
             operating_hours_start, operating_hours_end, certifications, notes)
           VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
          [
            Number(companyId), facilityName, facilityCode || null,
            addressLine1, addressLine2 || null, city,
            stateProvince || null, country, postalCode || null,
            latitude ? String(latitude) : null, longitude ? String(longitude) : null,
            productType, productCategory || null,
            Number(productionCapacityUnits), capacityPeriod || 'day',
            String(unitProductionTimeMinutes), String(unitCost), currency || 'USD',
            hasStorage ? 1 : 0,
            storageCapacityUnits ? Number(storageCapacityUnits) : null,
            storageCapacityVolumeCbm ? String(storageCapacityVolumeCbm) : null,
            minimumOrderQuantity ? Number(minimumOrderQuantity) : null,
            maximumOrderQuantity ? Number(maximumOrderQuantity) : null,
            leadTimeDays ? Number(leadTimeDays) : null,
            operatingHoursStart || null, operatingHoursEnd || null,
            certsJson, notes || null,
          ]
        ) as [mysql.ResultSetHeader, mysql.FieldPacket[]];
        insertId = result.insertId;
      }

      const [rows] = await conn.execute(
        `SELECT * FROM gs_facility WHERE id = ? LIMIT 1`, [insertId]
      ) as [mysql.RowDataPacket[], mysql.FieldPacket[]];

      res.status(201).json(rows[0] ?? { insertId });
    } finally {
      await conn.end();
    }
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error('[gridspace/facilities POST] ERROR:', msg);
    res.status(500).json({ error: 'Failed to create facility', message: msg });
  }
}
