import { Router } from "express";
import { z } from "zod";
import { query } from "../db";
import { requireAuth, requireRole } from "../middleware/auth";
import { sendError } from "../services/http";

const createComplaintSchema = z.object({
  categoryId: z.number().int().positive().optional(),
  categoryName: z.string().min(1).optional(),
  blockId: z.number().int().positive().optional(),
  blockName: z.string().min(1).optional(),
  roomNumber: z.number().int().positive().nullable().optional(),
  facilityType: z.enum(["Kitchen", "Toilet", "Shower", "Laundry"]).nullable().optional(),
  title: z.string().min(3),
  description: z.string().min(5),
  priority: z.enum(["Low", "Medium", "High"]),
});

const statusUpdateSchema = z.object({
  status: z.enum(["Pending", "Assigned", "Completed"]),
  wardenNote: z.string().optional(),
  adminNote: z.string().optional(),
});

export const complaintsRouter = Router();

async function ensureCategoryId(categoryId: number | null, categoryName: string | undefined) {
  if (categoryId != null) {
    return categoryId;
  }

  if (!categoryName) {
    throw new Error("Category is required");
  }

  const existing = await query<{ category_id: number }>(
    "SELECT category_id FROM public.complaint_category WHERE lower(category_name) = lower($1) LIMIT 1",
    [categoryName],
  );

  if (existing.rows.length > 0) {
    return existing.rows[0].category_id;
  }

  throw new Error("Selected category does not exist");
}

async function ensureBlockId(blockId: number | null, blockName: string | undefined) {
  if (blockId != null) {
    return blockId;
  }

  if (!blockName) {
    throw new Error("Block is required");
  }

  const blockMatch = blockName.match(/^Block\s+(\d{1,2})(?:\s*\(Laundry\))?$/i);
  if (!blockMatch) {
    throw new Error("Selected block does not exist");
  }

  const blockNum = Number(blockMatch[1]);

  const existing = await query<{ block_id: number; block_type: string }>(
    "SELECT block_id, block_type FROM public.block WHERE block_num = $1 OR lower(block_name) = lower($2) LIMIT 1",
    [blockNum, blockName],
  );

  if (existing.rows.length > 0) {
    return existing.rows[0].block_id;
  }

  throw new Error("Selected block does not exist");
}

complaintsRouter.use(requireAuth);

complaintsRouter.get("/", async (req, res) => {
  const isAdmin = req.user?.role === "admin";

  const result = await query<{
    complaint_id: string;
    submitted_by: string;
    category_name: string;
    block_name: string;
    room_number: number | null;
    facility_type: string | null;
    contractor_id: string | null;
    contractor_name: string | null;
    title: string;
    description: string;
    priority: "Low" | "Medium" | "High";
    status: "Pending" | "Assigned" | "Completed";
    date_submitted: string;
    student_name: string;
  }>(
    `SELECT c.complaint_id, c.submitted_by, cc.category_name, b.block_name,
      r.room_number, f.facility_type, con.contractor_id, con.contractor_name,
      c.title, c.description, c.priority, c.status,
      c.date_submitted,
      (u.first_name || ' ' || u.surname) AS student_name
    FROM public.complaint c
    JOIN public.users u ON u.user_id = c.submitted_by
    JOIN public.complaint_category cc ON cc.category_id = c.category_id
    JOIN public.block b ON b.block_id = c.block_id
    LEFT JOIN public.room r ON r.room_id = c.room_id
    LEFT JOIN public.facility f ON f.facility_id = c.facility_id
    LEFT JOIN public.assignment a ON a.complaint_id = c.complaint_id
    LEFT JOIN public.contractor con ON con.contractor_id = a.contractor_id
    WHERE ($1::boolean = true OR c.submitted_by = $2)
    ORDER BY c.date_submitted DESC`,
    [isAdmin, req.user?.userId],
  );

  const data = result.rows.map((row: (typeof result.rows)[number]) => ({
    id: row.complaint_id,
    studentId: row.submitted_by,
    category: row.category_name,
    block: row.block_name,
    room: row.room_number,
    facility: row.facility_type,
    assignedTo: row.contractor_id ?? undefined,
    assignedToName: row.contractor_name ?? undefined,
    title: row.title,
    description: row.description,
    priority: row.priority,
    status: row.status,
    dateSubmitted: row.date_submitted,
    studentName: row.student_name,
  }));

  return res.json(data);
});

complaintsRouter.get("/:id", async (req, res) => {
  const isAdmin = req.user?.role === "admin";

  const result = await query<{
    complaint_id: string;
    submitted_by: string;
    category_name: string;
    block_name: string;
    room_number: number | null;
    facility_type: string | null;
    contractor_id: string | null;
    contractor_name: string | null;
    title: string;
    description: string;
    priority: "Low" | "Medium" | "High";
    status: "Pending" | "Assigned" | "Completed";
    date_submitted: string;
    warden_note: string | null;
    student_name: string;
  }>(
    `SELECT c.complaint_id, c.submitted_by, cc.category_name, b.block_name,
      r.room_number, f.facility_type, con.contractor_id, con.contractor_name,
      c.title, c.description, c.priority, c.status,
      c.date_submitted, c.admin_note AS warden_note,
      (u.first_name || ' ' || u.surname) AS student_name
    FROM public.complaint c
    JOIN public.users u ON u.user_id = c.submitted_by
    JOIN public.complaint_category cc ON cc.category_id = c.category_id
    JOIN public.block b ON b.block_id = c.block_id
    LEFT JOIN public.room r ON r.room_id = c.room_id
    LEFT JOIN public.facility f ON f.facility_id = c.facility_id
    LEFT JOIN public.assignment a ON a.complaint_id = c.complaint_id
    LEFT JOIN public.contractor con ON con.contractor_id = a.contractor_id
    WHERE c.complaint_id = $1
      AND ($2::boolean = true OR c.submitted_by = $3)
    LIMIT 1`,
    [req.params.id, isAdmin, req.user?.userId],
  );

  if (result.rowCount === 0) {
    return sendError(res, 404, "Complaint not found");
  }

  return res.json(result.rows[0]);
});

complaintsRouter.post("/", async (req, res) => {
  const parsed = createComplaintSchema.safeParse(req.body);
  if (!parsed.success) {
    return sendError(res, 400, parsed.error.issues[0]?.message ?? "Invalid request body");
  }

  const { categoryId, categoryName, blockId, blockName, roomNumber, facilityType, title, description, priority } = parsed.data;

  let resolvedCategoryId: number;
  let resolvedBlockId: number;

  try {
    resolvedCategoryId = await ensureCategoryId(categoryId ?? null, categoryName);
    resolvedBlockId = await ensureBlockId(blockId ?? null, blockName);
  } catch (error) {
    return sendError(res, 400, error instanceof Error ? error.message : "Invalid complaint data");
  }

  const blockResult = await query<{ block_type: string }>(
    "SELECT block_type FROM public.block WHERE block_id = $1 LIMIT 1",
    [resolvedBlockId],
  );

  if (blockResult.rowCount === 0) {
    return sendError(res, 400, "Invalid block selected");
  }

  const isFacilityBlock = blockResult.rows[0].block_type === "Facility";
  let roomId: number | null = null;
  let facilityId: number | null = null;

  if (facilityType) {
    const facilityResult = await query<{ facility_id: number }>(
      "SELECT facility_id FROM public.facility WHERE block_id = $1 AND facility_type = $2 LIMIT 1",
      [resolvedBlockId, facilityType],
    );

    if (facilityResult.rows.length > 0) {
      facilityId = facilityResult.rows[0].facility_id;
    } else {
      return sendError(res, 400, "Selected facility is not available in this block");
    }
  } else {
    if (!roomNumber) {
      return sendError(res, 400, "Either room number or facility type is required");
    }

    const roomResult = await query<{ room_id: number }>(
      "SELECT room_id FROM public.room WHERE block_id = $1 AND room_number = $2 LIMIT 1",
      [resolvedBlockId, roomNumber],
    );

    if (roomResult.rows.length === 0) {
      return sendError(res, 400, "Selected room is not available in this block");
    }

    roomId = roomResult.rows[0].room_id;
  }

  if (!req.user) {
    return sendError(res, 401, "Unauthorized");
  }

  const result = await query<{ complaint_id: string }>(
    `INSERT INTO public.complaint
    (submitted_by, category_id, block_id, room_id, facility_id, title, description, priority)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    RETURNING complaint_id`,
    [req.user.userId, resolvedCategoryId, resolvedBlockId, roomId, facilityId, title, description, priority],
  );

  return res.status(201).json({ id: result.rows[0].complaint_id });
});

complaintsRouter.patch("/:id/status", requireRole(["admin"]), async (req, res) => {
  const parsed = statusUpdateSchema.safeParse(req.body);
  if (!parsed.success) {
    return sendError(res, 400, parsed.error.issues[0]?.message ?? "Invalid request body");
  }

  const result = await query(
    `UPDATE public.complaint
     SET status = $1,
         admin_note = COALESCE($2, admin_note)
     WHERE complaint_id = $3`,
    [parsed.data.status, parsed.data.adminNote ?? parsed.data.wardenNote ?? null, req.params.id],
  );

  if (result.rowCount === 0) {
    return sendError(res, 404, "Complaint not found");
  }

  if (parsed.data.status === "Completed") {
    await query(
      `UPDATE public.assignment
       SET date_completed = CURRENT_TIMESTAMP
       WHERE complaint_id = $1`,
      [req.params.id],
    );
  }

  return res.json({ message: "Complaint updated" });
});
