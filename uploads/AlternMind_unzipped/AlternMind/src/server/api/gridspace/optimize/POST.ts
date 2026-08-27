import type { Request, Response } from 'express';
import { db } from '../../../db/client.js';
import { gsOptimizationJob, gsCompany } from '../../../db/schema.js';
import { eq, and } from 'drizzle-orm';
import { requireGridspaceAuth } from '../../../lib/gridspaceAuth.js';
import { getSecret } from '#airo/secrets';

export default async function handler(req: Request, res: Response) {
  try {
    const auth = await requireGridspaceAuth(req, res);
    if (!auth) return;

    const { companyId, jobName, objectiveFunction, constraints, result: jobResult, status } = req.body;

    // --- Service path: update an existing job (optimizer posting results back) ---
    if (auth.isService && req.body.jobId) {
      const { jobId } = req.body;
      const [existing] = await db
        .select()
        .from(gsOptimizationJob)
        .where(eq(gsOptimizationJob.id, Number(jobId)))
        .limit(1);

      if (!existing) return res.status(404).json({ error: 'Job not found' });

      await db
        .update(gsOptimizationJob)
        .set({
          status: status || 'completed',
          resultPayload: jobResult ? JSON.stringify(jobResult) : null,
          completedAt: new Date(),
        })
        .where(eq(gsOptimizationJob.id, Number(jobId)));

      const [updated] = await db
        .select()
        .from(gsOptimizationJob)
        .where(eq(gsOptimizationJob.id, Number(jobId)))
        .limit(1);

      return res.json(updated);
    }

    // --- Browser / service path: submit a new job ---
    if (!companyId || !jobName) {
      return res.status(400).json({ error: 'companyId and jobName are required' });
    }

    // For browser sessions, verify the company belongs to the user
    let company;
    if (auth.isService) {
      const [found] = await db
        .select()
        .from(gsCompany)
        .where(eq(gsCompany.id, Number(companyId)))
        .limit(1);
      company = found;
    } else {
      const [found] = await db
        .select()
        .from(gsCompany)
        .where(and(eq(gsCompany.id, Number(companyId)), eq(gsCompany.userId, auth.userId)))
        .limit(1);
      company = found;
    }

    if (!company) return res.status(403).json({ error: 'Company not found or access denied' });

    const insertResult = await db.insert(gsOptimizationJob).values({
      companyId: Number(companyId),
      jobName,
      status: 'pending',
      objectiveFunction: objectiveFunction || 'minimize_cost',
      constraints: constraints ? JSON.stringify(constraints) : null,
      inputPayload: JSON.stringify(req.body),
    });

    const insertId = Number(insertResult[0].insertId);
    const [job] = await db
      .select()
      .from(gsOptimizationJob)
      .where(eq(gsOptimizationJob.id, insertId))
      .limit(1);

    // Dispatch to Python optimizer if configured
    const optimizerUrl = getSecret('OPTIMIZER_API_URL');
    if (optimizerUrl) {
      const optimizerSecret = getSecret('OPTIMIZER_API_SECRET');
      fetch(`${optimizerUrl}/optimize`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(optimizerSecret ? { Authorization: `Bearer ${optimizerSecret}` } : {}),
        },
        body: JSON.stringify(job),
      }).catch((err) => console.error('Optimizer dispatch failed', err));
    }

    res.status(201).json({
      ...job,
      message: optimizerUrl
        ? 'Optimization job dispatched to Python optimizer.'
        : 'Optimization job queued. Set OPTIMIZER_API_URL to connect your Python optimizer.',
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to submit optimization job', message: String(error) });
  }
}
