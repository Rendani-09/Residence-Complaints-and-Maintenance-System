import { Router } from "express";
import { z } from "zod";
import { query } from "../db";
import { requireAuth, requireRole } from "../middleware/auth";
import { sendError } from "../services/http";

const assignmentSchema = z.object({
  complaintId: z.string().uuid(),
  contractorId: z.string().uuid(),
});

export const adminRouter = Router();

adminRouter.use(requireAuth, requireRole(["admin"]));

adminRouter.post("/assignments", async (req, res) => {
  const parsed = assignmentSchema.safeParse(req.body);
  if (!parsed.success) {
    return sendError(res, 400, parsed.error.issues[0]?.message ?? "Invalid request body");
  }

  const { complaintId, contractorId } = parsed.data;

  if (!req.user) {
    return sendError(res, 401, "Unauthorized");
  }

  const assignmentResult = await query<{ assignment_id: string }>(
    `INSERT INTO public.assignment (complaint_id, contractor_id, assigned_by)
    VALUES ($1, $2, $3)
    ON CONFLICT (complaint_id)
    DO UPDATE SET contractor_id = EXCLUDED.contractor_id,
      assigned_by = EXCLUDED.assigned_by,
      date_assigned = CURRENT_TIMESTAMP,
      date_completed = NULL
    RETURNING assignment_id`,
    [complaintId, contractorId, req.user.userId],
  );

  await query(
    `UPDATE public.complaint SET status = 'Assigned' WHERE complaint_id = $1`,
    [complaintId],
  );

  return res.status(201).json({ assignmentId: assignmentResult.rows[0].assignment_id });
});

adminRouter.get("/analytics", async (_req, res) => {
  const [statusResult, priorityResult, pendingCount] = await Promise.all([
    query<{ status: string; count: string }>(
      `SELECT status, COUNT(*)::text AS count
       FROM public.complaint
       GROUP BY status
       ORDER BY status`,
    ),
    query<{ priority: string; count: string }>(
      `SELECT priority, COUNT(*)::text AS count
       FROM public.complaint
       GROUP BY priority
       ORDER BY priority`,
    ),
    query<{ count: string }>(
      `SELECT COUNT(*)::text AS count
       FROM public.complaint
       WHERE status = 'Pending'`,
    ),
  ]);

  return res.json({
    byStatus: statusResult.rows,
    byPriority: priorityResult.rows,
    pending: Number(pendingCount.rows[0]?.count ?? 0),
  });
});
