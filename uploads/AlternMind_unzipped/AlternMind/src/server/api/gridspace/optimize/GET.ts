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
      let jobs: mysql.RowDataPacket[];

      if (auth.isService) {
        const { status, companyId } = req.query as Record<string, string>;
        let sql = `SELECT * FROM gs_optimization_job`;
        const params: unknown[] = [];
        const conditions: string[] = [];
        if (status) { conditions.push(`status = ?`); params.push(status); }
        if (companyId) { conditions.push(`company_id = ?`); params.push(Number(companyId)); }
        if (conditions.length) sql += ` WHERE ` + conditions.join(' AND ');
        sql += ` ORDER BY created_at DESC`;
        [jobs] = await conn.execute(sql, params) as [mysql.RowDataPacket[], mysql.FieldPacket[]];
      } else {
        // Get this user's company IDs first
        const [companies] = await conn.execute(
          `SELECT id FROM gs_company WHERE user_id = ?`, [auth.userId]
        ) as [mysql.RowDataPacket[], mysql.FieldPacket[]];

        if (!companies.length) return res.json([]);

        const ids = companies.map((c) => c.id);
        const placeholders = ids.map(() => '?').join(',');
        [jobs] = await conn.execute(
          `SELECT * FROM gs_optimization_job WHERE company_id IN (${placeholders}) ORDER BY created_at DESC`,
          ids
        ) as [mysql.RowDataPacket[], mysql.FieldPacket[]];
      }

      // Normalise snake_case to camelCase
      const result = jobs.map((j) => ({
        id: j.id,
        companyId: j.company_id,
        jobName: j.job_name,
        status: j.status,
        objectiveFunction: j.objective_function,
        inputData: j.input_data,
        resultData: j.result_data,
        errorMessage: j.error_message,
        createdAt: j.created_at,
        updatedAt: j.updated_at,
      }));

      res.json(result);
    } finally {
      await conn.end();
    }
  } catch (error) {
    console.error('[gridspace/optimize GET]', error);
    res.status(500).json({ error: 'Failed to fetch jobs', message: String(error) });
  }
}
