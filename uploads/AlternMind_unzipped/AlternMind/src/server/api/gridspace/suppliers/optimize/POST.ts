/**
 * POST /api/gridspace/suppliers/optimize
 * Raw mysql2 — avoids Drizzle schema mismatch on live DB.
 */
import type { Request, Response } from 'express';
import mysql from 'mysql2/promise';
import { getDatabaseCredentials } from '../../../../db/config.js';
import { requireGridspaceAuth } from '../../../../lib/gridspaceAuth.js';
import { getSecret } from '#airo/secrets';

interface Requirement {
  productType: string;
  quantity: number;
  deliveryDeadline: string;
  destinationCity: string;
  destinationCountry: string;
  currency?: string;
}

interface SupplierScore {
  companyId: number;
  companyName: string;
  companyType: string;
  contactEmail: string;
  estimatedUnitCost: number | null;
  estimatedTotalCost: number | null;
  estimatedLeadDays: number | null;
  canMeetDeadline: boolean | null;
  currency: string;
  score: number;
  scoreBreakdown: { costScore: number; leadTimeScore: number; capacityScore: number };
  matchedAssets: mysql.RowDataPacket[];
  notes: string[];
}

function daysBetween(from: Date, to: Date): number {
  return Math.ceil((to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24));
}

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

    const { requirement, supplierIds, mode = 'manual' } = req.body as {
      requirement: Requirement;
      supplierIds?: number[];
      mode?: 'auto' | 'manual';
    };

    if (!requirement?.productType || !requirement?.quantity || !requirement?.deliveryDeadline) {
      return res.status(400).json({ error: 'requirement.productType, quantity, and deliveryDeadline are required' });
    }

    const deadline = new Date(requirement.deliveryDeadline);
    if (isNaN(deadline.getTime())) return res.status(400).json({ error: 'Invalid deliveryDeadline' });

    const today = new Date();
    const daysUntilDeadline = daysBetween(today, deadline);
    const currency = requirement.currency || 'USD';

    const conn = await getConn();
    try {
      // Fetch all companies
      const [allCompanies] = await conn.execute(
        `SELECT * FROM gs_company`
      ) as [mysql.RowDataPacket[], mysql.FieldPacket[]];

      // Filter candidates
      let candidates = allCompanies.filter((c) => c.company_type === 'manufacturer');

      if (mode === 'manual' && supplierIds?.length) {
        candidates = candidates.filter((c) => supplierIds.includes(c.id));
      }
      if (!auth.isService && auth.userId) {
        candidates = candidates.filter((c) => c.user_id !== auth.userId);
      }

      // Enrich with facilities
      const enriched = await Promise.all(
        candidates.map(async (company) => {
          const [rows] = await conn.execute(
            `SELECT * FROM gs_facility WHERE company_id = ?`, [company.id]
          ) as [mysql.RowDataPacket[], mysql.FieldPacket[]];

          const matching = rows.filter((f) =>
            (f.product_type ?? '').toLowerCase().includes(requirement.productType.toLowerCase()) ||
            (f.product_category ?? '').toLowerCase().includes(requirement.productType.toLowerCase()),
          );

          return { company, matching };
        }),
      );

      // Gather cost/lead for normalization
      const rawCosts: number[] = [];
      const rawLeads: number[] = [];
      for (const { matching } of enriched) {
        for (const f of matching) {
          const cost = f.unit_cost ? parseFloat(f.unit_cost) : null;
          const lead = f.lead_time_days ?? null;
          if (cost !== null && !isNaN(cost)) rawCosts.push(cost);
          if (lead !== null) rawLeads.push(lead);
        }
      }

      const minCost = rawCosts.length ? Math.min(...rawCosts) : null;
      const maxCost = rawCosts.length ? Math.max(...rawCosts) : null;
      const minLead = rawLeads.length ? Math.min(...rawLeads) : null;
      const maxLead = rawLeads.length ? Math.max(...rawLeads) : null;

      const scored: SupplierScore[] = [];

      for (const { company, matching } of enriched) {
        if (matching.length === 0) continue;

        const notes: string[] = [];
        const capable = matching.filter(
          (f) => f.production_capacity_units !== null && f.production_capacity_units >= requirement.quantity,
        );
        const pool = capable.length > 0 ? capable : matching;
        pool.sort((a, b) => {
          const ca = a.unit_cost ? parseFloat(a.unit_cost) : Infinity;
          const cb = b.unit_cost ? parseFloat(b.unit_cost) : Infinity;
          return ca - cb;
        });

        const best = pool[0];
        const unitCost = best.unit_cost ? parseFloat(best.unit_cost) : null;
        const totalCost = unitCost !== null ? unitCost * requirement.quantity : null;
        const leadDays = best.lead_time_days ?? null;
        const canMeet = leadDays !== null ? leadDays <= daysUntilDeadline : null;

        if (capable.length === 0) notes.push(`No single facility meets the full quantity of ${requirement.quantity} units — split order may be required.`);
        if (canMeet === false) notes.push(`Lead time of ${leadDays} days exceeds deadline (${daysUntilDeadline} days away).`);

        let costScore = 20;
        if (unitCost !== null && minCost !== null && maxCost !== null && maxCost !== minCost) {
          costScore = Math.round(40 * (1 - (unitCost - minCost) / (maxCost - minCost)));
        } else if (unitCost !== null) {
          costScore = 40;
        }

        let leadTimeScore = 20;
        if (leadDays !== null && minLead !== null && maxLead !== null && maxLead !== minLead) {
          leadTimeScore = Math.round(40 * (1 - (leadDays - minLead) / (maxLead - minLead)));
        } else if (leadDays !== null) {
          leadTimeScore = 40;
        }

        const capacityScore = capable.length > 0 ? 20 : 10;
        const score = costScore + leadTimeScore + capacityScore;

        scored.push({
          companyId: company.id,
          companyName: company.company_name,
          companyType: company.company_type,
          contactEmail: company.contact_email,
          estimatedUnitCost: unitCost,
          estimatedTotalCost: totalCost,
          estimatedLeadDays: leadDays,
          canMeetDeadline: canMeet,
          currency,
          score,
          scoreBreakdown: { costScore, leadTimeScore, capacityScore },
          matchedAssets: pool.slice(0, 3),
          notes,
        });
      }

      scored.sort((a, b) => b.score - a.score);

      // Persist optimization job for history (non-fatal if it fails)
      if (!auth.isService && auth.userId) {
        try {
          const [buyerCompanies] = await conn.execute(
            `SELECT id FROM gs_company WHERE user_id = ? LIMIT 1`, [auth.userId]
          ) as [mysql.RowDataPacket[], mysql.FieldPacket[]];

          if (buyerCompanies.length > 0) {
            await conn.execute(
              `INSERT INTO gs_optimization_job (company_id, job_name, status, objective_function, input_data, result_data, created_at, updated_at)
               VALUES (?, ?, 'completed', 'minimize_cost', ?, ?, NOW(), NOW())`,
              [
                buyerCompanies[0].id,
                `Supplier search: ${requirement.productType} × ${requirement.quantity}`,
                JSON.stringify({ requirement, supplierIds, mode }),
                JSON.stringify({ ranked: scored.length, topSupplier: scored[0]?.companyName }),
              ]
            );
          }
        } catch {
          // Non-fatal — don't block the response
        }
      }

      // Optionally dispatch to Python optimizer
      const optimizerUrl = getSecret('OPTIMIZER_API_URL');
      const optimizerSecret = getSecret('OPTIMIZER_API_SECRET');
      let deepOptimizationJobId: number | null = null;

      if (optimizerUrl) {
        try {
          const dispatchRes = await fetch(`${optimizerUrl}/supplier-optimize`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              ...(optimizerSecret ? { Authorization: `Bearer ${optimizerSecret}` } : {}),
            },
            body: JSON.stringify({ requirement, candidates: scored, mode }),
          });
          if (dispatchRes.ok) {
            const data = await dispatchRes.json() as { jobId?: number };
            deepOptimizationJobId = data.jobId ?? null;
          }
        } catch {
          // Non-fatal
        }
      }

      res.json({
        requirement,
        mode,
        ranked: scored,
        total: scored.length,
        deepOptimizationJobId,
        note: optimizerUrl
          ? 'Heuristic ranking returned. Deep optimization dispatched to Python backend.'
          : 'Heuristic ranking returned. Connect OPTIMIZER_API_URL for quantum/classical deep optimization.',
      });
    } finally {
      await conn.end();
    }
  } catch (error) {
    console.error('[gridspace/suppliers/optimize POST]', error);
    res.status(500).json({ error: 'Supplier optimization failed', message: String(error) });
  }
}
