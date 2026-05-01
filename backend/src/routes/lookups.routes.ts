import { Router } from "express";
import { query } from "../db";
import { requireAuth } from "../middleware/auth";

export const lookupsRouter = Router();

lookupsRouter.use(requireAuth);

lookupsRouter.get("/categories", async (_req, res) => {
  const result = await query<{ category_id: number; category_name: string }>(
    `SELECT category_id, category_name FROM public.complaint_category ORDER BY category_name`,
  );
  return res.json(result.rows);
});

lookupsRouter.get("/blocks", async (_req, res) => {
  const result = await query<{ block_id: number; block_name: string; block_type: string }>(
    `SELECT block_id, block_name, block_type FROM public.block ORDER BY block_num`,
  );
  return res.json(result.rows);
});

lookupsRouter.get("/contractors", async (_req, res) => {
  const result = await query<{ contractor_id: string; contractor_name: string; specialization: string }>(
    `SELECT contractor_id, contractor_name, specialization
     FROM public.contractor
     ORDER BY contractor_name`,
  );
  return res.json(result.rows);
});
